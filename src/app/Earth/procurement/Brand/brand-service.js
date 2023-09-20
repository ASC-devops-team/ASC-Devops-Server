const Store = require("./brand-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Brands";
const userId = 1;
let currentCounter = 1;

class BrandService {
  constructor(store) {}

  // Add
  async add(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const data = req.body;

      const newBrand = await store.add(data);

      res.status(201).json({
        message: "Brand added successfully",
        uuid: userId,
        module: moduleName,
        data: data,
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

  async getAllData(req, res, next) {
    try {
      let result = [];
      const store = new Store(req.db);
      result = await store.getAll();

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
        message: "Brand Deleted successfuly",
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

// Function to convert Excel date to "dd/mm/yyyy" format
// function convertExcelDate(excelDate) {
//   const baseDate = DateTime.fromObject({ year: 1900, month: 1, day: 1 });
//   const convertedDate = baseDate.plus({ days: excelDate - 2 });
//   return convertedDate.toFormat("yyyy/MM/dd");
// }

module.exports = BrandService;
