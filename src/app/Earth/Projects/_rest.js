const express = require("express");
const auth = require("../../../middlewares/auth");
const db = require("../../../middlewares/db");
const schema = require("../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./project-service");
const uploadFile = require("../../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

//Add / Import
router.post("/project", db, asyncHandler(service.add));

//Get
router.get("/project/get/:uuid", auth, db, asyncHandler(service.get));

//Graph & Table
// router.get("/nursery/data", db, asyncHandler(service.getData));

//Update
router.put("/project/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/project/delete/:uuid", db, asyncHandler(service.delete));

//Export
// router.get("/project/export", db, asyncHandler(service.exportDataToExcel));

module.exports = router;
