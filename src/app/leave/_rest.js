const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./leave-service");
const uploadFile = require("../../middlewares/upload-file");

const service = new Service();
const router = express.Router();

// CREATE
router.post("/leave", db, uploadFile, asyncHandler(service.add));

// READS
router.get("/leave/get", db, asyncHandler(service.getData));

// // GET EXISTING
// router.get("/leave/get/existing", db, asyncHandler(service.getByUerIdAndDate));

// // UPDATE
// router.put("/leave/update", db, asyncHandler(service.update));

// // READ
// router.get("/leave/get/:uuid", auth, db, asyncHandler(service.get));

// // DELETE
// router.delete("/leave/delete/:uuid", db, asyncHandler(service.delete));

module.exports = router;
