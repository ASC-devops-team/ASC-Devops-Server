const Store = require("./leave-store");
const AttendanceStore = require("../attendance/attendance-store");
const RoutingStore = require("../approvalRoute/approvalRoute-store");
const Logs = require("../logs/logs-store");
const { NotFoundError, BadRequestError } = require("../../middlewares/errors");

class LeaveService {
  // Submit Leave
  async add(req, res, next) {
    try {
      const current = new Date();
      const routingStore = new RoutingStore(req.db);
      const attendanceStore = new AttendanceStore(req.db);
      const store = new Store(req.db);
      const body = req.body;
      const userId = req.query.userId;
      const dateFrom = new Date(body.date_from);
      const dateTo = new Date(body.date_to);
      const routing = await routingStore.getData("leave");

      body.processing = routing.boss1;
      const leaveDuration = Math.ceil(
        (dateTo - dateFrom) / (1000 * 60 * 60 * 24) + 1
      );
      if (
        body.leave_type === "VL" ||
        body.leave_type === "SL" ||
        body.leave_type === "EL"
      ) {
        const leaveCount = await attendanceStore.getLeaveCountByUserId(
          userId,
          body.leave_type
        );
        if (leaveCount >= 15) {
          throw new BadRequestError(
            `Reached the maximum ${body.leave_type} for this year`
          );
        }
        body.date = current;
        body.duration = leaveDuration;
        body.vl_balance = body.leave_type === "VL" ? leaveCount : 0;
        body.sl_balance = body.leave_type === "SL" ? leaveCount : 0;
      } else {
        throw new BadRequestError("Invalid leave type.");
      }
      const result = await store.add(userId, body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get Table Data
  async getData(req, res, next) {
    try {
      const store = new Store(req.db);
      const { startDate, endDate, reviewer } = req.query;
      const table = await store.getData(startDate, endDate, reviewer);
      const stats = await store.getStatCount(startDate, endDate, reviewer);
      const pending = stats.pending_count;
      const approved = stats.approved_count;
      const rejected = stats.rejected_count;
      return res.status(200).send({
        success: true,
        data: { table, pending, approved, rejected },
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
      const body = req.body;
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
      } else {
        body.processing = null;
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
