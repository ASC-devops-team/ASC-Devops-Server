const { query } = require("express");
const canvassTableConfig = require("../../../../configuration/procurement/canvassTableConfig");

class CanvassStore {
  constructor(db) {
    this.db = db;
    this.table = canvassTableConfig.tableName;
    this.cols = canvassTableConfig.columnNames;
  }

  async add(data) {
    // Check if an item with the same item_code already exists
    const existing = await this.db(this.table)
      .where("item_code", data.item_code)
      .first();

    if (existing) {
      // If it exists, update the existing item's quantity by adding 1
      const result = await this.db(this.table)
        .where("item_code", data.item_code)
        .increment("quantity", 1);
      return result;
    } else {
      // If it doesn't exist, insert a new item
      const result = await this.db(this.table).insert({
        name: data.name,
        price: data.price,
        item_code: data.item_code,
        quantity: data.quantity,
        description: data.description,
      });
      return result;
    }
  }

  async getAllCart() {
    try {
      const results = await this.db
        .select(
          "canvass.uuid",
          "canvass.name",
          "canvass.item_code",
          "canvass.quantity",
          "canvass.price",
          "canvass.description",
          "canvass.created_at",
          "canvass.updated_at",
          "brand.name as brand",
          "supplier.name as supplier"
        )
        .from("canvass")
        .join("product", "product.item_code", "=", "canvass.item_code")
        .join("brand", "product.brand_id", "=", "brand.uuid")
        .join("supplier", "product.supplier_id", "=", "supplier.uuid");

      return results;
    } catch (error) {
      // Handle any potential errors here
      console.error("Error in getAll:", error);
      throw error; // You can choose to rethrow the error or handle it differently
    }
  }

  async getCartPrice() {
    try {
      const result = await this.db(this.table)
        .select(this.db.raw("SUM(price * quantity) as total_price"))
        .count(`${this.cols.id} as items`)
        .first();

      if (result !== undefined && result !== null) {
        // Check if either total_price or items is not null
        if (result.total_price !== null && result.items !== null) {
          return result;
        } else {
          return { total_price: 0, items: 0 };
        }
      } else {
        // Handle the case where the table is empty
        return { total_price: 0, items: 0 };
      }
    } catch (error) {
      console.error("Error calculating cart price:", error);
      throw error;
    }
  }

  async update(uuid, body) {
    // Perform the update operation
    await this.db(this.table).where(this.cols.id, uuid).update({
      quantity: body.quantity,
    });
    // Fetch the updated rows
    const updatedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    return updatedRows;
  }

  async getByUUID(uuid) {
    const results = await this.db(this.table)
      .select()
      .where(this.cols.id, uuid);
    return results;
  }

  async getAll() {
    const results = await this.db(this.table)
      .select(
        "product.uuid",
        "product.name",
        "product.price",
        "product.item_code",
        "product.description",
        "product.created_at",
        "product.updated_at",
        "product.added_by",
        "brand.name as brand_name",
        "category.name as category_name",
        "supplier.name as supplier_name"
      )
      .join("brand", "product.brand_id", "=", "brand.uuid")
      .join("category", "product.category_id", "=", "category.uuid")
      .join("supplier", "product.supplier_id", "=", "supplier.uuid");

    return results;
  }

  // async getAll() {
  //   const results = await this.db(this.table)
  //     .select()
  //     .orderBy([{ column: this.cols.date, order: "desc" }]);
  //   if (!results) {
  //     return null;
  //   }
  //   const columnNames = await this.db(this.table)
  //     .columnInfo()
  //     .then((columns) => Object.keys(columns));
  //   return results.length > 0 ? convertedResults : { columnNames };
  // }

  async delete(uuid) {
    const deletedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    await this.db(this.table).where(this.cols.id, uuid).del();
    return deletedRows;
  }

  // async getMaxDate() {
  //   const result = await this.db(this.table)
  //     .max(`${this.cols.reportDate} as max_date`)
  //     .first();
  //   if (result.max_date === null) {
  //     return null;
  //   }
  //   const convertedResults = convertDatesToTimezone([result], ["max_date"]);
  //   return convertedResults[0].max_date;
  // }

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

  // async totalBeneficiary(region, startDate, endDate, search) {
  //   const formattedStartDate = formatDate(startDate);
  //   const formattedEndDate = formatDate(endDate);
  //   const maxDate = await this.getMaxDate();
  //   const firstDate = firstDateOfMonth(maxDate);
  //   const lastDate = lastDateOfMonth(maxDate);
  //   const result = await this.db(this.table)
  //     .count(`${this.cols.coopName} AS count`)
  //     .where((query) => {
  //       if (!maxDate) {
  //         query.whereRaw("false");
  //       } else if (startDate && endDate) {
  //         query.whereBetween(this.cols.reportDate, [
  //           formattedStartDate,
  //           formattedEndDate,
  //         ]);
  //       } else {
  //         query.whereBetween(this.cols.reportDate, [firstDate, lastDate]);
  //       }

  //       if (region) {
  //         query.where(this.cols.region, region);
  //       }

  //       if (search) {
  //         query.andWhere((builder) => {
  //           Object.values(this.cols).forEach((column) => {
  //             builder.orWhere(column, "like", `%${search}%`);
  //           });
  //         });
  //       }
  //     })
  //     .first();
  //   const count = result ? result.count : 0;
  //   return count;
  // }
}

// function formatDate(dateString) {
//   const date = moment(dateString, "YYYY/MM/DD", true);
//   if (!date.isValid()) {
//     return "";
//   }
//   return date.format("YYYY-MM-DD");
// }

// function convertDatesToTimezone(rows, dateFields) {
//   return rows.map((row) => {
//     const convertedFields = {};
//     dateFields.forEach((field) => {
//       const convertedDate = moment
//         .utc(row[field])
//         .tz("Asia/Singapore")
//         .format("YYYY-MM-DD");
//       convertedFields[field] = convertedDate;
//     });
//     return { ...row, ...convertedFields };
//   });
// }

// function sixMonthBehindDate(date) {
//   const sixMonthsAgo = moment(date).subtract(6, "months");
//   const firstDate = sixMonthsAgo.startOf("month").format("YYYY-MM-DD");
//   return firstDate;
// }

// function firstDateOfMonth(date) {
//   const firstDate = moment(date).startOf("month").format("YYYY-MM-DD");
//   return firstDate;
// }

// function lastDateOfMonth(date) {
//   const lastDate = moment(date).endOf("month").format("YYYY-MM-DD");
//   return lastDate;
// }

module.exports = CanvassStore;
