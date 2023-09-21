const express = require("express");
const router = express.Router();
const { errorHandler } = require("../middlewares/errors");

router.use(errorHandler);
router.use(require("./users/_rest"));
router.use(require("./download/_rest"));
router.use(require("./logs/_rest"));

router.use(require("./attendance/_rest"));

module.exports = router;
