const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./brand-service");
const uploadFile = require("../../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add
router.post("/brand", db, asyncHandler(service.add));

//Get
router.get("/brand/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/brand/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/brand/delete/:uuid", db, asyncHandler(service.delete));

//getAllData
router.get("/brand/get", db, asyncHandler(service.getAllData));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;
