const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./balance-service");

const service = new Service();
const router = express.Router();

// READS
router.get("/balance/get/:uuid", db, asyncHandler(service.getBalance));

// UPDATE
router.put("/balance", db, asyncHandler(service.update));

module.exports = router;
