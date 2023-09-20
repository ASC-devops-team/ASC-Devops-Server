const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./purchase-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/purchase", db, asyncHandler(service.Add));

//Get All
router.get("/purchase/get", db, asyncHandler(service.getAllData));

//Get
router.get("/purchase/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/purchase/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/purchase/delete/:uuid", db, asyncHandler(service.delete));

// Get All Items
router.get("/purchase/getAllItems", db, asyncHandler(service.getAllItems));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;
