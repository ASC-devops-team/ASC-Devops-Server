const Store = require("./leave-store");
const AttendanceStore = require("../attendance/attendance-store");
const RoutingStore = require("../approvalRoute/approvalRoute-store");
const BalanceStore = require("../leaveBalance/balance-store");
const Logs = require("../logs/logs-store");
const { NotFoundError, BadRequestError } = require("../../middlewares/errors");

const current = new Date();
const lastDayOfYear = new Date(current.getFullYear(), 11, 31);

class LeaveService {
  // Submit Leave
  async add(req, res, next) {
    try {
      const leaveStore = new Store(req.db);
      const routingStore = new RoutingStore(req.db);
      const balanceStore = new BalanceStore(req.db);
      const body = req.body;
      const userId = req.query.userId;
      const dateFrom = new Date(body.date_from);
      const dateTo = new Date(body.date_to);
      const routing = await routingStore.getData("leave");
      if (routing === undefined) {
        throw new NotFoundError(
          `Leave approval routing not found, please contact the admin to set it up.`
        );
      }
      if (body.day_type === "Full") {
        body.duration = Math.ceil(
          (dateTo - dateFrom) / (1000 * 60 * 60 * 24) + 1
        );
      } else {
        body.duration = 0.5;
      }

      body.date = current;
      body.processing = routing.boss1;

      const balance = await balanceStore.getBalance(userId, lastDayOfYear);
      body.sl_balance = balance.sl;
      body.vl_balance = balance.vl;
      if (body.leave_type === "SL" && balance.sl) {
        balance.sl -= body.duration;
        balance.used_leaves += body.duration;
        body.payment_type = "Paid";
      }
      if (body.leave_type === "VL" && balance.vl) {
        balance.vl -= body.duration;
        balance.used_leaves += body.duration;
        body.payment_type = "Paid";
      }
      const result = await leaveStore.add(userId, body);
      await balanceStore.updateBalance(balance);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Table Data ( reviewer means user id)
  async getData(req, res, next) {
    try {
      const routingStore = new RoutingStore(req.db);
      const store = new Store(req.db);
      const { startDate, endDate, reviewer } = req.query;
      const { boss1 } = (await routingStore.getData("leave")) ?? {};
      if (boss1 === undefined) {
        throw new NotFoundError(
          `Leave approval routing not found, please contact the admin to set it up.`
        );
      }
      const table = await store.getData(startDate, endDate, reviewer, boss1);
      const stats = await store.getStatCount(
        startDate,
        endDate,
        reviewer,
        boss1
      );
      const pending = stats.pending_count;
      const progress = stats.in_progress_count;
      const approved = stats.approved_count;
      const rejected = stats.rejected_count;
      return res.status(200).send({
        success: true,
        data: { table, pending, progress, approved, rejected, boss1 },
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Table Data by User
  async getDataByUser(req, res, next) {
    try {
      const store = new Store(req.db);
      const userId = req.params.uuid;
      const table = await store.getDataByUser(userId);
      return res.status(200).send({
        success: true,
        data: table,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      const routingStore = new RoutingStore(req.db);
      const balanceStore = new BalanceStore(req.db);
      const body = req.body;
      console.log(body);
      const routing = await routingStore.getData("leave");
      if (
        body.status === "Approved" &&
        body.reviewed_by !== routing.final_boss
      ) {
        if (body.processing === routing.boss1) {
          body.processing = routing.boss2;
        } else if (body.processing === routing.boss2) {
          body.processing = routing.boss3;
        } else if (body.processing === routing.boss3) {
          body.processing = routing.boss4;
        }
        body.status = "Pending";
      } else if (
        body.status === "Approved" &&
        body.reviewed_by === routing.final_boss
      ) {
        body.processing = null;
      } else {
        const balance = await balanceStore.getBalance(
          body.user_id,
          lastDayOfYear
        );
        if (body.leave_type === "SL" && balance.sl) {
          balance.sl += body.duration;
          balance.used_leaves -= body.duration;
        }
        if (body.leave_type === "VL" && balance.vl) {
          balance.vl += body.duration;
          balance.used_leaves -= body.duration;
        }
        await balanceStore.updateBalance(balance);
      }
      const result = await store.update(body);
      if (result === 0) {
        throw new NotFoundError("ID not found");
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

  // // GET EXISTING
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

  // // READ
  // async get(req, res, next) {
  //   try {
  //     const store = new Store(req.db);
  //     const logs = new Logs(req.db);
  //     const uuid = req.params.uuid;
  //     const result = await store.getById(uuid);
  //     if (!result) {
  //       throw new NotFoundError("Data Not Found");
  //     }
  //     return res.status(200).send({
  //       success: true,
  //       data: result,
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // // DELETE
  // async delete(req, res, next) {
  //   try {
  //     const store = new Store(req.db);
  //     const logs = new Logs(req.db);
  //     const uuid = req.params.uuid;
  //     const body = req.body;
  //     //const userId = req.auth.id; // Get user ID using auth
  //     const result = await store.delete(uuid);
  //     if (result === 0) {
  //       throw new NotFoundError("Data Not Found");
  //     }
  //     logs.add({
  //       uuid: userId,
  //       module: moduleName,
  //       action: `deleted a row in ${moduleName} table`,
  //       data: result,
  //       ...body,
  //     });
  //     return res.status(202).send({
  //       success: true,
  //       message: "Product Deleted successfuly",
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}

function calculateTotalWorkHours(
  clockInTime,
  clockOutTime,
  lunchStart,
  lunchEnd
) {
  // Calculate lunch break duration
  const lunchBreakDuration = Math.max(
    0,
    Math.min(clockOutTime, lunchEnd) - Math.max(clockInTime, lunchStart)
  );
  // Calculate total work duration
  const totalWorkDuration = clockOutTime - clockInTime - lunchBreakDuration;
  // Convert the total work duration to hours, minutes, and seconds
  const hours = Math.floor(totalWorkDuration / (60 * 60 * 1000));
  const minutes = Math.floor(
    (totalWorkDuration % (60 * 60 * 1000)) / (60 * 1000)
  );
  const seconds = Math.floor((totalWorkDuration % (60 * 1000)) / 1000);
  return `${hours}:${minutes}:${seconds}`;
}

// Format the clock_in time from the database that is readable by calculateTotalWorkHours function
function parseClockInDateTime(dateStr, timeStr) {
  const [hours, minutes, seconds] = timeStr.split(":").map(Number);
  const clockInTime = new Date(dateStr);
  clockInTime.setHours(hours, minutes, seconds, 0);
  return clockInTime;
}

function buildTime(hours) {
  const time = new Date();
  time.setHours(hours, 0, 0, 0);
  return time.getTime();
}

function getTimeDifference(startTime, endTime) {
  const timeDifferenceMs = Math.abs(endTime - startTime);
  const hours = Math.floor(timeDifferenceMs / (60 * 60 * 1000));
  const minutes = Math.floor(
    (timeDifferenceMs % (60 * 60 * 1000)) / (60 * 1000)
  );
  const seconds = Math.floor((timeDifferenceMs % (60 * 1000)) / 1000);
  return `${hours}:${minutes}:${seconds}`;
}

module.exports = LeaveService;
