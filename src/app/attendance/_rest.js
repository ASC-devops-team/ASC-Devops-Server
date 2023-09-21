const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./attendance-service");

const service = new Service();
const router = express.Router();

// CREATE
router.post("/attendance", db, asyncHandler(service.add));

// READS
router.get("/attendance/get", db, asyncHandler(service.getAll));

// READ
router.get("/attendance/get/:uuid", auth, db, asyncHandler(service.get));

// UPDATE
router.put("/attendance/update/:uuid", db, asyncHandler(service.update));

// DELETE
router.delete("/attendance/delete/:uuid", db, asyncHandler(service.delete));

module.exports = router;
