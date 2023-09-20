const express = require("express");
const auth = require("../../../../middlewares/auth");
const db = require("../../../../middlewares/db");
const asyncHandler = require("express-async-handler");
const Service = require("./canvass-service");

const service = new Service();
const router = express.Router();

//Add
router.post("/canvass", db, asyncHandler(service.add));

//Get All
router.get("/canvass/get", db, asyncHandler(service.getAllCart));

//Get Cart Price
router.get("/canvass/price", db, asyncHandler(service.getCartPrice));

//Get
router.get("/canvass/get/:uuid", auth, db, asyncHandler(service.get));

//Update
router.put("/canvass/update/:uuid", db, asyncHandler(service.updateQuantity));

//Delete
router.delete("/canvass/delete/:uuid", db, asyncHandler(service.delete));



module.exports = router;
