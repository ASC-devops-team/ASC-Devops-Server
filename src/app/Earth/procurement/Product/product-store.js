const { query } = require("express");
const productTableConfig = require("../../../../configuration/procurement/productTableConfig");

class ProductStore {
  constructor(db) {
    this.db = db;
    this.table = productTableConfig.tableName;
    this.cols = productTableConfig.columnNames;
  }

  async add(data) {
    const existing = await this.db(this.table).where("name", data.name).first();

    if (existing) {
      throw new Error("Product with the same name already exists!");
    }

    const newProduct = {
      item_code: data.item_code,
      brand_id: data.brand_id,
      price: data.price,
      category_id: data.category_id,
      supplier_id: data.supplier_id,
      name: data.name,
      description: data.description,
      added_by: data.added_by,
    };

    const uuid = await this.db(this.table).insert(newProduct);

    return {
      uid: uuid[0],
      ...newProduct,
    };
  }

  async getPrice(startRange, endRange) {
    const products = await this.db(this.table)
      .select("*")
      .whereBetween("price", [startRange, endRange]);

    return products;
  }

  async getAll(category, brand, supplier, minPrice, maxPrice) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.db(this.table)
          .select(
            "product.uuid",
            "product.name",
            "product.price",
            "product.item_code",
            "product.description",
            "product.brand_id",
            "product.category_id",
            "product.supplier_id",
            "product.created_at",
            "product.updated_at",
            "product.added_by",
            "supplier.name as supplier_company",
            "supplier.address as supplier_address",
            "brand.name as brand_name",
            "category.name as category_name",
            "supplier.name as supplier_name",
            "supplier.phone_no",
            "supplier.mobile_no",
            "supplier.tin_no"
          )
          .join("brand", "product.brand_id", "=", "brand.uuid")
          .join("category", "product.category_id", "=", "category.uuid")
          .join("supplier", "product.supplier_id", "=", "supplier.uuid")
          .orderBy([{ column: this.cols.name, order: "asc" }])
          .where((builder) => {
            if (category) {
              builder.where(this.cols.categoryId, category);
              console.log("category");
            }
            if (brand) {
              builder.where(this.cols.brandId, brand);
              console.log("brand");
            }
            if (supplier) {
              builder.where(this.cols.supplierId, supplier);
              console.log(supplier);
            }
            if (minPrice && maxPrice) {
              builder.whereBetween(this.cols.price, [minPrice, maxPrice]);
              console.log("price range");
            }
          });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  async update(uuid, body) {
    // Perform the update operation
    await this.db(this.table).where(this.cols.id, uuid).update({
      item_code: body.item_code,
      brand_id: body.brand_id,
      category_id: body.category_id,
      supplier_id: body.supplier_id,
      name: body.name,
      description: body.description,
      added_by: body.added_by,
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

module.exports = ProductStore;
