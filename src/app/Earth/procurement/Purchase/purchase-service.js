const Store = require("./purchase-store");
const ItemStore = require("../PurchaseItem/purchaseItem-store");
const Logs = require("../../../logs/logs-store");
const { NotFoundError } = require("../../../../middlewares/errors");
const { log } = require("console");
const moduleName = "Purchase";
const userId = 1;
const currentDate = new Date();

class PurchaseService {
  constructor(store) {}

  // Add
  async Add(req, res, next) {
    try {
      const store = new Store(req.db);
      const itemStore = new ItemStore(req.db);
      const logs = new Logs(req.db);
      const data = req.body; // Pass the entire request body
      const prefix = "MWC-PRF";
      const counter = await store.getMaxUUID();
      const refCode = generateRefCode(data, counter);
      const prCode = generateProcessCode(prefix, counter);
      const totalAmount = getTotalAmount(data.items);
      const supplierByID = await store.getSupplierByID(
        data.items[0].supplier_id
      );

      // Calculate the total quantity of items
      const totalQuantity = data.items.reduce(
        (accumulator, currentItem) => accumulator + currentItem.quantity,
        0
      );

      await itemStore.add(data.items, prCode);
      await store.add({
        ...data,
        item_count: totalQuantity, // Use the total quantity here
        ref_code: refCode,
        pr_code: prCode,
        total_amount: totalAmount,
        request_date: currentDate,
      });

      const response = {
        message: "Purchase Request added successfully",
        module: "Purchase Request",
        data: {
          company_name: supplierByID[0].name,
          address: supplierByID[0].address,
          ...data,
        },
      };
      res.status(201).json(response); // Send the response back to the client
    } catch (err) {
      next(err);
    }
  }

  async getAllData(req, res, next) {
    try {
      let result = [];
      const store = new Store(req.db);
      const processType = req.query;
      result = await store.getAll(processType);

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

  //eto yung sa get all items
  async getAllItems(req, res, next) {
    try {
      const { ref_code } = req.query; // Use prRef_code if it matches your route definition

      if (!ref_code) {
        // Handle the case where prRef_code is missing in the request
        return res.status(400).json({ error: "ref code is required" });
      }

      const itemStore = new ItemStore(req.db);
      // const store = new Store(req.db);
      // const request = await store.getAll();
      const items = await itemStore.getAll(ref_code);

      if (items.length === 0) {
        // Handle the case where no items were found
        return res
          .status(404)
          .json({ error: `No items found for ${ref_code}` });
      }

      // Send the items as a response
      return res.status(200).send({
        success: true,
        ref_code: ref_code,
        data: items,
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

  // Update Order
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      const counter = await store.getMaxUUID();
      //const userId = req.auth.id;
      let poCode = null;
      let tfCode = null;
      let poDate = null;
      let tfDate = null;
      if (body.process_type === "order") {
        poCode = generateProcessCode("MCW-PO", counter);
        poDate = currentDate;
      }
      if (body.process_type === "transmittal") {
        tfCode = generateProcessCode("MWC-TF", counter);
        tfDate = currentDate;
      }
      const result = await store.update(uuid, {
        ...body,
        po_code: poCode,
        order_date: poDate,
        tf_code: tfCode,
        transmit_date: tfDate,
      });
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

function generateRefCode(data, counter) {
  let currentYear = new Date().getFullYear();
  currentYear = String(currentYear).padStart(4, "0");
  counter = String(counter).padStart(4, "0");
  const refCode = `REF${data.items[0].item_code
    .substring(0, 2)
    .toUpperCase()}${data.remarks
    .substring(0, 2)
    .toUpperCase()}${data.items[0].price
    .toString()
    .slice(-2)}${currentYear}${counter}`;
  return refCode;
}

function generateProcessCode(prefix, counter) {
  let currentYear = new Date().getFullYear();
  currentYear = String(currentYear).padStart(4, "0");
  counter = String(counter).padStart(4, "0");
  const Code = `${prefix}-${currentYear}-${counter}`;
  return Code;
}

function getTotalAmount(dataArray) {
  const totalAmountSum = dataArray.reduce(
    (sum, data) => sum + data.price * data.quantity,
    0
  );
  return totalAmountSum;
}

module.exports = PurchaseService;
