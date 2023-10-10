const Store = require("./attendance-store");
const Logs = require("../logs/logs-store");
const { NotFoundError } = require("../../middlewares/errors");

class AttendaceService {
  // CLOCK IN
  async add(req, res, next) {
    try {
      const current = new Date();
      const currentTime = current.getTime();
      const store = new Store(req.db);
      const body = req.body;
      const userRole = req.query.userRole;

      const checkTimes = [
        { access_level: "User", start: 7 },
        { access_level: "Super Admin", start: 8 },
      ];

      const roleInfo = checkTimes.find(
        (info) => info.access_level === userRole
      );

      if (!roleInfo) {
        throw new Error("Invalid userRole");
      }

      const startWorkTime = buildTime(roleInfo.start);

      let status = currentTime <= startWorkTime ? "Present" : "Late";
      let late =
        status === "Late"
          ? getTimeDifference(startWorkTime, currentTime)
          : null;

      body.clock_in = current;
      body.date = current;
      body.late = late;
      body.status = status;

      const result = await store.add(body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // CLOCK OUT
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      const body = req.body;
      const userRole = req.query.userRole; // Assuming you have defined userRole

      const current = new Date();
      const currentTime = current.getTime(); // Get current time in milliseconds

      const checkTimes = [
        { access_level: "User", start: 16, end: 17 },
        { access_level: "Super Admin", start: 17, end: 18 },
      ];
      // Calculate total work hours excluding lunch break
      const lunchStart = buildTime(12);
      const lunchEnd = buildTime(13);
      const clockInTime = parseClockInDateTime(body.date, body.clock_in);

      // Calculate total work hours based on clock_in and current time, excluding lunch break
      const totalWorkHours = calculateTotalWorkHours(
        clockInTime,
        current,
        lunchStart,
        lunchEnd
      );

      let { status, undertime, overtime } = calculateStatusAndTimes(
        userRole,
        currentTime,
        body.status,
        checkTimes,
        totalWorkHours
      );

      body.clock_out = current;
      body.undertime = undertime;
      body.overtime = overtime;
      body.work_hours = totalWorkHours;
      body.status = status;

      const result = await store.update(body);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }
      return res.status(200).send({
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
      const { startDate, endDate } = req.query;
      let result = [];
      result = await store.getData(startDate, endDate);
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET EXISTING
  async getByUerIdAndDate(req, res, next) {
    try {
      const store = new Store(req.db);
      const { userId, date } = req.query;
      const result = await store.getByUerIdAndDate(userId, date);
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // READ
  async get(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const result = await store.getById(uuid);
      if (!result) {
        throw new NotFoundError("Data Not Found");
      }
      return res.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE
  async delete(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      //const userId = req.auth.id; // Get user ID using auth
      const result = await store.delete(uuid);
      if (result === 0) {
        throw new NotFoundError("Data Not Found");
      }
      logs.add({
        uuid: userId,
        module: moduleName,
        action: `deleted a row in ${moduleName} table`,
        data: result,
        ...body,
      });
      return res.status(202).send({
        success: true,
        message: "Product Deleted successfuly",
      });
    } catch (err) {
      next(err);
    }
  }
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

function calculateStatusAndTimes(
  userRole,
  currentTime,
  status,
  checkTimes,
  totalWorkHours
) {
  let undertime = null;
  let overtime = null;
  const hour = parseInt(totalWorkHours.split(":")[0]);
  for (const checkTime of checkTimes) {
    if (userRole === checkTime.access_level) {
      if (hour < 8) {
        if (currentTime < buildTime(checkTime.start) && status === "Present") {
          status = "Undertime";
          undertime = getTimeDifference(
            buildTime(checkTime.start),
            currentTime
          );
        } else if (
          currentTime < buildTime(checkTime.start) &&
          status === "Late"
        ) {
          status = "Late & Undertime";
          undertime = getTimeDifference(
            currentTime,
            buildTime(checkTime.start)
          );
        }
      } else if (hour >= 9) {
        if (currentTime > buildTime(checkTime.end) && status === "Present") {
          status = "Overtime";
          overtime = getTimeDifference(currentTime, buildTime(checkTime.start));
        } else if (
          currentTime > buildTime(checkTime.end) &&
          status === "Late"
        ) {
          status = "Late & Overtime";
          overtime = getTimeDifference(currentTime, buildTime(checkTime.start));
        }
      }
      break; // Exit the loop after finding the applicable role
    }
  }
  return { status, undertime, overtime };
}

module.exports = AttendaceService;
