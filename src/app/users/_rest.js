const express = require("express");
const auth = require("../../middlewares/auth");
const refreshToken = require("../../middlewares/refreshToken");
const db = require("../../middlewares/db");
const schema = require("../../middlewares/schema");
const asyncHandler = require("express-async-handler");
const UserService = require("./users-service");
const { restart } = require("nodemon");

const service = new UserService();
const router = express.Router();

// User login
router.post("/login", db, schema, asyncHandler(service.login));

// Log out
router.get("/logout", db, asyncHandler(service.logout));

// Use Refresh Token
router.get("/refresh", db, asyncHandler(service.refresh));

// Register new user
router.post("/register", db, asyncHandler(service.register));

// Get password for download Data
router.post("/password", db, asyncHandler(service.password));

// Get user by QR Code
router.get("/user", db, asyncHandler(service.userByQR));

// Get all users
router.get("/users", db, asyncHandler(service.getData));

// Update user
router.put("/user/:uuid", db, asyncHandler(service.updateUser));

// Update user personal
router.put("/userPersonal/:uuid", db, asyncHandler(service.updatePersonal));

// Update user account
router.put("/userAccount/:uuid", db, asyncHandler(service.updateAccount));

// Delete a user
// router.delete('/user/:uuid', db, asyncHandler(service.delete));

module.exports = router;
