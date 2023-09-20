const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const schema = require("../../../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const Service = require("./purchaseItem-service");

const service = new Service();
const router = express.Router();

//Add
router.post("/purchaseitem", db, asyncHandler(service.Add));

//Get All
router.get("/purchaseitem/get", db, asyncHandler(service.getAllData));

//Get
router.get("/purchaseitem/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/purchaseitem/update/:uuid", db, asyncHandler(service.update));

//Delete
router.delete("/purchaseitem/delete/:uuid", db, asyncHandler(service.delete));

// Get All Items
router.get("/purchaseitem/getAllItems", db, asyncHandler(service.getAllItems));


module.exports = router;
