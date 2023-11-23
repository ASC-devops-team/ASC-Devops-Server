const express = require("express");
const router = express.Router();
const { errorHandler } = require("../middlewares/errors");

const delayMiddleware = (req, res, next) => {
  setTimeout(next, 1000); // 1000 milliseconds = 1 second
};

// Apply the delay middleware before other routes
// router.use(delayMiddleware);

router.use(require("./users/_rest"));
router.use(require("./download/_rest"));
router.use(require("./logs/_rest"));

router.use(require("./attendance/_rest"));
router.use(require("./leave/_rest"));
router.use(require("./equipment/_rest"));
router.use(require("./device/_rest"));
router.use(require("./approvalRoute/_rest"));
router.use(require("./leaveBalance/_rest"));
router.use(require("./event/_rest"));

router.use(errorHandler); //should alway be the last

module.exports = router;
