const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./equipment-service");

const service = new Service();
const router = express.Router();

// CREATE
router.post("/equipment", db, asyncHandler(service.add));

// READS
router.get("/equipment/get", db, asyncHandler(service.getData));

// UPDATE
router.put("/equipment", db, asyncHandler(service.update));

// // GET EXISTING
// router.get(
//   "/equipment/get/existing",
//   db,
//   asyncHandler(service.getByUerIdAndDate)
// );

// // UPDATE
// router.put("/equipment/update", db, asyncHandler(service.update));



// // READ
// router.get("/attendance/get/:uuid", auth, db, asyncHandler(service.get));

// // DELETE
// router.delete("/attendance/delete/:uuid", db, asyncHandler(service.delete));

module.exports = router;
