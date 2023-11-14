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

      // If boss2 is provided, set final_boss to boss2
      if (body.boss2 && !body.boss3 && !body.boss4) {
        body.final_boss = body.boss2;
      }
      // If boss3 is provided, set final_boss to boss3
      else if (body.boss3 && !body.boss4) {
        body.final_boss = body.boss3;
      }
      // If boss4 is provided, set final_boss to boss4
      else if (body.boss4) {
        body.final_boss = body.boss4;
      }
      // If only boss1 is provided, set final_boss to boss1
      else if (body.boss1 && !body.boss2 && !body.boss3 && !body.boss4) {
        body.final_boss = body.boss1;
      }

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
      const { name } = req.query;
      let result = [];
      result = await store.getData(name);
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
