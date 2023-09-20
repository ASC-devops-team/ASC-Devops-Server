const Store = require("./purchaseItem-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const moduleName = "PurchaseItem";
const userId = 1;
let currentCounter = 101;

class PurchaseItemService {
  constructor(store) {}

  //update an item in purchase request
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      //const userId = req.auth.id;
      const result = await store.update(uuid, body);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }

      return res.status(200).send({
        message: "Purchase Updated successfully",
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
  
  //delete an item in purchase items
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
      // logs.add({
      //   uuid: userId,
      //   module: moduleName,
      //   action: `deleted a row in ${moduleName} table`,
      //   data: result,
      //   ...body,
      // });
      return res.status(202).send({
        success: true,
        message: "Purchase Deleted successfuly",
      });
    } catch (err) {
      next(err);
    }
  }
  
}

// function generatePrCode(data) {
//   const currentYear = new Date().getFullYear();
//   const paddedCounter = currentCounter.toString().padStart(4, "0");

//   currentCounter++;

//   return `${data[0].product_id}${data[0].brand_id}${data[0].category_id}${
//     data[0].supplier_id
//   }${data[0].item_code
//     .substring(0, 2)
//     .toUpperCase()}${currentYear}${paddedCounter}`;
// }

module.exports = PurchaseItemService;
