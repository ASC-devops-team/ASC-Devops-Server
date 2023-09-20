const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./supplier-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/supplier", db, asyncHandler(service.add));

//Get
router.get("/supplier/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/supplier/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/supplier/delete/:uuid", db, asyncHandler(service.delete));

//getAllData
router.get("/supplier/get", db, asyncHandler(service.getAllData));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;
