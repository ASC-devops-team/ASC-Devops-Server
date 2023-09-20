const { query } = require("express");
const purchaseTableConfig = require("../../../../configuration/procurement/purchaseTableConfig");
const supplierTableConfig = require("../../../../configuration/procurement/supplierTableConfig");

class PurchaseStore {
  constructor(db) {
    this.db = db;
    this.table = purchaseTableConfig.tableName;
    this.supplierTable = supplierTableConfig.tableName;
    this.cols = purchaseTableConfig.columnNames;
  }

  async add(data) {
    return new Promise(async (resolve, reject) => {
      try {
        //eto pang retrieve
        const supplierId = data.items[0].supplier_id;
        const supplier = await this.db("supplier")
          .select("name", "address")
          .where("uuid", supplierId)
          .first();

        //eto pang check kung nag eexist si supplier based sa supplier_id
        if (!supplier) {
          reject({ message: "Supplier not found." });
          return;
        }

        const result = await this.db(this.table).insert({
          ref_code: data.ref_code,
          pr_code: data.pr_code,
          company_name: supplier.name,
          address: supplier.address,
          item_count: data.item_count,
          total_amount: data.total_amount,
          remarks: data.remarks,
          attention: data.attention,
          request_date: data.request_date,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async update(uuid, body) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.db(this.table).where(this.cols.id, uuid).update({
          // Purchase Request
          process_type: body?.process_type,
          remarks: body?.remarks,
          attention: body?.attention,
          // Purchase Order
          po_code: body?.po_code,
          order_date: body?.order_date,
          or_code: body?.or_code,
          order_due_date: body?.order_due_date,
          terms_of_agreement: body?.terms_of_agreement,
          // Transmittal
          tf_code: body?.tf_code,
          purpose: body?.purpose,
          billing_date: body?.billing_date,
          prepared_date: body?.prepared_date,
          received_date: body?.received_date,
          prepared_by: body?.prepared_by,
          received_by: body?.received_by,
        });
        const updatedRows = await this.db(this.table)
          .where(this.cols.id, uuid)
          .select("*")
          .first();
        resolve(updatedRows);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getMaxUUID() {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.db(this.table)
          .max("uuid as max_uuid")
          .first();
        const maxUUID = result.max_uuid || 0; // Default to 0 if no result is found
        resolve(maxUUID + 1);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSupplierByID(suppID) {
    const results = await this.db(this.supplierTable)
      .select()
      .where(this.cols.id, suppID);
    return results;
  }

  async getAll(processType) {
    const results = await this.db(this.table)
      .select()
      .where(this.cols.processType, "=", processType.processName);
    return results;
  }

  async getByUUID(uuid) {
    const results = await this.db(this.table)
      .select()
      .where(this.cols.id, uuid);
    return results;
  }

  async delete(uuid) {
    const deletedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    await this.db(this.table).where(this.cols.id, uuid).del();
    return deletedRows;
  }

  async search(startDate, endDate, search) {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const maxDate = await this.getMaxDate();
    // const firstDate = firstDateOfMonth(maxDate);
    // const lastDate = lastDateOfMonth(maxDate);
    const query = this.db(this.table)
      .select()
      .orderBy([{ column: this.cols.startDate, order: "desc" }]);
    if (!maxDate) {
      return [];
    }
    if (startDate && endDate) {
      query.whereBetween(this.cols.startDate, [
        formattedStartDate,
        formattedEndDate,
      ]);
    } else {
      query.whereBetween(this.cols.startDate, [firstDate, lastDate]);
    }
    if (search) {
      const columns = await this.db(this.table).columnInfo();
      query.andWhere((builder) => {
        builder.where((innerBuilder) => {
          Object.keys(columns).forEach((column) => {
            innerBuilder.orWhere(column, "like", `%${search}%`);
          });
        });
      });
    }
    const results = await query;
    const convertedResults = convertDatesToTimezone(
      results.map((row) => row),
      [this.cols.startDate]
    );
    return convertedResults;
  }
}

module.exports = PurchaseStore;
