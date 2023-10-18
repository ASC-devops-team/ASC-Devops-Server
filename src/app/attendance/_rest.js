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

// GET EXISTING
router.get(
  "/attendance/get/existing",
  db,
  asyncHandler(service.getByUerIdAndDate)
);

// UPDATE
router.put("/attendance/update", db, asyncHandler(service.update));

// READS
router.get("/attendance/get", db, asyncHandler(service.getData));

// // READ
// router.get("/attendance/get/:uuid", auth, db, asyncHandler(service.get));

// // DELETE
// router.delete("/attendance/delete/:uuid", db, asyncHandler(service.delete));

module.exports = router;
