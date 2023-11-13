const Store = require("./approvalRoute-store");
const Logs = require("../logs/logs-store");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../../middlewares/errors");

class ApprovalRouteService {
  // CLOCK IN
  async add(req, res, next) {
    try {
      const store = new Store(req.db);
      const body = req.body;
      const result = await store.add(body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // READS
  async getData(req, res, next) {
    try {
      const store = new Store(req.db);
      let result = [];
      result = await store.getData();
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // // GET EXISTING (if existing it mean user has already logged in so next call will be clock-out)
  // async getByUerIdAndDate(req, res, next) {
  //   try {
  //     const store = new Store(req.db);
  //     const { userId, date } = req.query;
  //     const result = await store.getByUerIdAndDate(userId, date);
  //     return res.status(200).send({
  //       success: true,
  //       data: result,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // // UPDATE
  // async update(req, res, next) {
  //   try {
  //     const store = new Store(req.db);
  //     const body = req.body;
  //     const result = await store.update(body);
  //     if (result === 0) {
  //       throw new NotFoundError("Device not found");
  //     }

  //     return res.status(200).send({
  //       success: true,
  //       data: body,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}

module.exports = ApprovalRouteService;
