const BalanceStore = require("./balance-store");
const Logs = require("../logs/logs-store");
const { NotFoundError, BadRequestError } = require("../../middlewares/errors");

class BalanceService {
  // Get Table Data by User
  async getBalance(req, res, next) {
    try {
      const userId = req.params.uuid;
      const balanceStore = new BalanceStore(req.db);
      const current = new Date();
      const lastDayOfYear = new Date(current.getFullYear(), 11, 31);
      const data = {
        validity: lastDayOfYear,
        user_id: userId,
      };
      let result = 0;
      result = await balanceStore.getBalance(userId, lastDayOfYear);
      if (!result) {
        result = await balanceStore.add(data);
      }
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user
  async update(req, res, next) {
    try {
      const balanceStore = new BalanceStore(req.db);
      const body = req.body;
      let result = [];
      result = await balanceStore.getBalance(body.user_id);
      if (result === 0) {
        throw new NotFoundError("Resource not found");
      }
      if (body.type === "SL") {
        result.sl--;
        result.used_leaves++;
      }
      if (body.type === "VL") {
        result.vl--;
        result.used_leaves++;
      }

      return res.status(200).send({
        success: true,
        message: "Successfully Updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = BalanceService;
