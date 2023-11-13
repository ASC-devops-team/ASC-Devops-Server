const moment = require("moment-timezone");
const TableConfig = require("../../configuration/deviceConfig");

class DeviceStore {
  constructor(db) {
    this.db = db;
    this.table = TableConfig.tableName;
    this.cols = TableConfig.columnNames;
  }

  // CREATE
  async add(body) {
    try {
      const result = await this.db(this.table).insert({
        name: body?.name,
        type: body?.type,
        brand: body?.brand,
        model: body?.model,
        serial_code: body?.serial_code,
        issued_date: body?.issued_date,
        returned_date: body?.returned_date,
        purchase_date: body?.purchase_date,
        purchase_price: body?.purchase_price,
        current_value: body?.current_value,
        notes: body?.notes,
        status: body?.status,
        user_id: body?.user_id,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // READS
  async getData() {
    try {
      let query = this.db(this.table).select();
      const results = await query;
      const convertedResults = convertDatesToTimezone(
        results.map((row) => row),
        [
          this.cols.issuedDate,
          this.cols.returnedDate,
          this.cols.purchaseDate,
          this.cols.createdAt,
        ]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  // GET EXISTING
  async getByUerIdAndDate(userId, date) {
    try {
      const result = await this.db(this.table)
        .select()
        .where(this.cols.userid, userId)
        .andWhere(this.cols.date, date)
        .first();
      if (result) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  // UPDATE
  async update(body) {
    try {
      const result = await this.db(this.table)
        .update({
          name: body?.name,
          type: body?.type,
          brand: body?.brand,
          model: body?.model,
          serial_code: body?.serial_code,
          issued_date: body?.issued_date,
          returned_date: body?.returned_date,
          purchase_date: body?.purchase_date,
          purchase_price: body?.purchase_price,
          current_value: body?.current_value,
          current_value: body?.current_value,
          notes: body?.notes,
          status: body?.status,
          user_id: body?.user_id,
        })
        .where("uuid", body.uuid);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // GET Leave Balance
  async getLeaveCountByUserId(userId, leaveType) {
    try {
      const currentYear = new Date().getFullYear(); // Get the year from the current date
      const result = await this.db(this.table)
        .count()
        .where(this.cols.userid, userId)
        .andWhere(this.cols.status, leaveType)
        .whereRaw(`YEAR(${this.cols.date}) = ${currentYear}`);
      const leaveCount = result[0]["count(*)"] || 0;
      return leaveCount;
    } catch (error) {
      throw error; // Instead of using reject, you can throw the error for cleaner async/await handling
    }
  }

  // READ
  // async getById(uuid) {
  //   const results = await this.db(this.table)
  //     .select()
  //     .where(this.cols.id, uuid);
  //   return results;
  // }

  // DELETE
  // async delete(uuid) {
  //   const deletedRows = await this.db(this.table)
  //     .where(this.cols.id, uuid)
  //     .select("*")
  //     .first();
  //   await this.db(this.table).where(this.cols.id, uuid).del();
  //   return deletedRows;
  // }
}

function formatDate(dateString) {
  const date = moment(dateString, "YYYY/MM/DD", true);
  if (!date.isValid()) {
    return "";
  } // code from TAD reports
  return date.format("YYYY-MM-DD");
}

function convertDatesToTimezone(rows, dateFields) {
  return rows.map((row) => {
    const convertedFields = {};
    dateFields.forEach((field) => {
      const originalDate = row[field];

      // Check if the date field is null
      if (originalDate === null) {
        convertedFields[field] = null;
      } else {
        // Convert non-null date to the desired format
        const convertedDate = moment
          .utc(originalDate)
          .tz("Asia/Singapore")
          .format("YYYY-MM-DD");
        convertedFields[field] = convertedDate;
      }
    });
    return { ...row, ...convertedFields };
  });
}

module.exports = DeviceStore;
