const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./attendance-service");

const service = new Service();
const router = express.Router();

// CREATE
router.post("/attendance/in", db, asyncHandler(service.clockin));

// GET EXISTING
router.get(
  "/attendance/existing",
  db,
  asyncHandler(service.getByUserIdAndDate)
);

// UPDATE Clock out
router.put("/attendance/out", db, asyncHandler(service.clockout));

// READS
router.get("/attendance/get", db, asyncHandler(service.getData));

// UPDATE ATTENDANCE DTR
router.put("/attendance/update", db, asyncHandler(service.update));

// // READ
// router.get("/attendance/get/:uuid", auth, db, asyncHandler(service.get));

// // DELETE
// router.delete("/attendance/delete/:uuid", db, asyncHandler(service.delete));

module.exports = router;
