const express = require("express");
const router = express.Router();
const { errorHandler } = require("../middlewares/errors");


router.use(require("./users/_rest"));
router.use(require("./download/_rest"));
router.use(require("./logs/_rest"));

router.use(require("./attendance/_rest"));
router.use(require("./leave/_rest"));
router.use(require("./equipment/_rest"));
router.use(require("./device/_rest"));
router.use(require("./approvalRoute/_rest"));

router.use(errorHandler); //should alway be the last

module.exports = router;
