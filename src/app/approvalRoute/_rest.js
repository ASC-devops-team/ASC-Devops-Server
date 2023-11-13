const express = require("express");
const auth = require("../../middlewares/auth");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./approvalRoute-service");

const service = new Service();
const router = express.Router();

// CREATE & UPDATE IF FAIL
router.post("/approval", db, asyncHandler(service.add));

// READS
router.get("/approval/get", db, asyncHandler(service.getData));


module.exports = router;
