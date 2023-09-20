const express = require("express");
const router = express.Router();
const { errorHandler } = require("../middlewares/errors");

router.use(errorHandler);
router.use(require("./users/_rest"));
router.use(require("./download/_rest"));
router.use(require("./logs/_rest"));

// EARTH
router.use(require("./Earth/Projects/_rest"));
router.use(require("./Earth/procurement/Supplier/_rest"));
router.use(require("./Earth/procurement/Category/_rest"));
router.use(require("./Earth/procurement/Brand/_rest"));
router.use(require("./Earth/procurement/Product/_rest"));
router.use(require("./Earth/procurement/Canvass/_rest"));
router.use(require("./Earth/procurement/Purchase/_rest"));
router.use(require(".//Earth/procurement/PurchaseItem/_rest"));

module.exports = router;
