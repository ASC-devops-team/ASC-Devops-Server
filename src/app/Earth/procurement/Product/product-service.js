const Store = require("./product-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Products";
const userId = 1;
let currentCounter = 1;

class ProductService {
  constructor(store) {}

  // Add
  async add(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const data = req.body;
      const item_code = generateReferenceCode(data);

      const result = await store.add({
        ...data,
        item_code,
        ...{ added_by: userId },
      });

      res.status(201).json({
        message: "Product added successfully",
        module: moduleName,
        data: {
          ...result,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getPriceRange(req, res, next) {
    try {
      const { startRange, endRange } = req.query;
      const store = new Store(req.db);

      const clampedStartRange = Math.min(
        Math.max(parseInt(startRange, 10), 0),
        999999
      );

      const clampedEndRange = Math.min(
        Math.max(parseInt(endRange, 10), 0),
        999999
      );

      let priceRange;
      if (!isNaN(clampedStartRange) && !isNaN(clampedEndRange)) {
        priceRange = await store.getPrice(clampedStartRange, clampedEndRange);
      } else {
        priceRange = await store.getAll();
      }
      res.status(200).json({
        module: moduleName,
        data: priceRange,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get
  async get(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const result = await store.getByUUID(uuid);
      if (!result) {
        throw new NotFoundError("Data Not Found");
      }
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  //Get All Data
  async getAllData(req, res, next) {
    try {
      const { category, brand, supplier, minPrice, maxPrice } = req.query;
      let result = [];
      const store = new Store(req.db);
      result = await store.getAll(
        category,
        brand,
        supplier,
        minPrice,
        maxPrice
      );

      if (!result) {
        result = [];
      }
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      //const userId = req.auth.id;
      const id = await store.getByUUID(uuid);
      if (!id) {
        throw new NotFoundError("ID Not Found");
      }
      const result = await store.update(uuid, body);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }
      // logs.add({
      //   uuid: userId,
      //   module: moduleName,
      //   action: `updated a row in ${moduleName} table`,
      //   data: result,
      //   ...body
      // });
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete
  async delete(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      //const userId = req.auth.id; // Get user ID using auth
      const result = await store.delete(uuid);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }
      logs.add({
        uuid: userId,
        module: moduleName,
        action: `deleted a row in ${moduleName} table`,
        data: result,
        ...body,
      });
      return res.status(202).send({
        success: true,
        message: "Product Deleted successfuly",
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Graph Data
  //   async getData(req, res, next) {
  //     try {
  //       const store = new Store(req.db);
  //       const region = req.query.region;
  //       const startDate = req.query.start;
  //       const endDate = req.query.end;
  //       const search = req.query.search;

  //       let total = 0;
  //       let table = [];
  //       let lineGraph = [];
  //       let barGraph = [];

  //       const hasData = await store.getAll();

  //       if (hasData.length > 0) {
  //         lineGraph = await store.getLineGraph(
  //           region,
  //           startDate,
  //           endDate,
  //           search
  //         );
  //         barGraph = await store.getBarGraph(region, startDate, endDate, search);
  //         table = await store.search(region, startDate, endDate, search);
  //         total = await store.totalBeneficiary(
  //           region,
  //           startDate,
  //           endDate,
  //           search
  //         );
  //       } else {
  //         table = await store.getAll();
  //       }
  //       return res.status(200).send({
  //         success: true,
  //         total: total,
  //         lineGraph: lineGraph,
  //         barGraph: barGraph,
  //         table: table,
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
}

function generateReferenceCode(data) {
  const currentYear = new Date().getFullYear();
  const paddedCounter = currentCounter.toString().padStart(4, "0");

  currentCounter++;

  return `${data.brand_id}${data.category_id}${data.supplier_id}${data.name
    .substring(0, 2)
    .toUpperCase()}${currentYear}${paddedCounter}`;
}

// Function to convert Excel date to "dd/mm/yyyy" format
// function convertExcelDate(excelDate) {
//   const baseDate = DateTime.fromObject({ year: 1900, month: 1, day: 1 });
//   const convertedDate = baseDate.plus({ days: excelDate - 2 });
//   return convertedDate.toFormat("yyyy/MM/dd");
// }

module.exports = ProductService;
