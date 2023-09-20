const { query } = require("express");
const purchaseItemTableConfig = require("../../../../configuration/procurement/purchaseItemTableConfig");

class PurchaseItemStore {
  constructor(db) {
    this.db = db;
    this.table = purchaseItemTableConfig.tableName;
    this.cols = purchaseItemTableConfig.columnNames;
  }

  async add(dataArray, refCode) {
    return new Promise(async (resolve, reject) => {
      try {
        const dataWithPrCode = dataArray.map((data) => ({
          ...data,
          ref_code: refCode,
        }));
        const result = await this.db(this.table).insert(dataWithPrCode);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  //get all items
  async getAll(prRef_code) {
    try {
      const results = await this.db
        .select(
          "purchase_item.created_at as date",
          "purchase_item.item_code",
          "purchase_item.ref_code",
          "purchase_item.price",
          "purchase_item.quantity",
          "purchase_item.description",
          "product.name",
          "brand.name as brand_name",
          "supplier.name as supplier_name",
          "category.name as category_name"
        )
        .from("purchase_item")
        .join("product", "purchase_item.item_code", "=", "product.item_code")
        .join("brand", "purchase_item.brand_id", "=", "brand.uuid")
        .join("supplier", "purchase_item.supplier_id", "=", "supplier.uuid")
        .join("category", "purchase_item.category_id", "=", "category.uuid")
        .where("purchase_item.ref_code", "like", `%${prRef_code}%`);

      return results;
    } catch (error) {
      console.error("Error in getAll:", error);
      throw error;
    }
  }

  async update(uuid, body) {
  
      await this.db(this.table)
        .where(this.cols.id, uuid)
        .update({
          item_code: body.item_code,
          price: body.price,
          quantity: body.quantity,
          product_id: body.product_id,
          brand_id: body.brand_id,
          supplier_id: body.supplier_id,
          category_id: body.category_id,
          description: body.description,
        });
  
      const updatedRow = await this.db(this.table)
        .where(this.cols.id, uuid)
        .select("*")
        .first();
  
      return updatedRow;
  }

  async delete(uuid) {
    const deletedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    await this.db(this.table).where(this.cols.id, uuid).del();
    return deletedRows;
  }

  

}

module.exports = PurchaseItemStore;
