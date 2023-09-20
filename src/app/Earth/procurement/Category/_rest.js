const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./category-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/category", db, asyncHandler(service.add));

//Get
router.get("/category/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/category/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/category/delete/:uuid", db, asyncHandler(service.delete));

//getAllData
router.get("/category/get", db, asyncHandler(service.getAllData));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;
