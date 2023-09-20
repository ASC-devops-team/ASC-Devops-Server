const Store = require("./category-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "Categories";
const userId = 1;
let currentCounter = 1;

class CategoryService {
  constructor(store) {}

  // Add
  async add(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const data = req.body;

      const newCategory = await store.add(data);

      res
        .status(201)
        .json({
          message: "Category added successfully",
          uuid: userId,
          module: moduleName,
          data: data,
        });
    } catch (err) {
      next(err);
    }
  }

  // Get by UUID
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

  //Get All
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
        message: "Category Deleted successfuly",
      });
    } catch (err) {
      next(err);
    }
  }

  
}

function generateReferenceCode(data) {
  const currentYear = new Date().getFullYear();
  const paddedCounter = currentCounter.toString().padStart(4, "0");
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

module.exports = CategoryService;
