const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./product-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/product", db, asyncHandler(service.add));

//Get
router.get("/product/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/product/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/product/delete/:uuid", db, asyncHandler(service.delete));

//getAllData
router.get("/product/get", db, asyncHandler(service.getAllData));

//getPriceRange
router.get("/product/price", db, asyncHandler(service.getPriceRange));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;
