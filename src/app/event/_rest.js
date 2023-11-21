const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./event-service");
const uploadFile = require("../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

// CREATE
router.post("/event", db, asyncHandler(service.add));

// READS
router.get("/event/get", db, asyncHandler(service.getData));

// READS
router.get("/event/get/:uuid", db, asyncHandler(service.getDataByUser));

// // DELETE
router.delete("/event/delete/:uuid", db, asyncHandler(service.delete));

module.exports = router;
