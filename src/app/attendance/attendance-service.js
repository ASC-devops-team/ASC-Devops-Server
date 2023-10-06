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
        { role: "user", start: 7 },
        { role: "superadmin", start: 8 },
      ];

      const roleInfo = checkTimes.find((info) => info.role === userRole);

      if (!roleInfo) {
        throw new Error("Invalid userRole");
      }

      const startWorkTime = buildTime(roleInfo.start);

      let status = currentTime < startWorkTime ? "Present" : "Late";
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
        { role: "user", start: 16, end: 17 },
        { role: "superadmin", start: 17, end: 18 },
      ];

      let undertime = null;
      let overtime = null;
      let status = body.status;

      for (const checkTime of checkTimes) {
        if (userRole === checkTime.role) {
          if (currentTime < buildTime(checkTime.start) && status === "Late") {
            status = "Late & Undertime";
            undertime = getTimeDifference(
              currentTime,
              buildTime(checkTime.start)
            );
          } else if (
            currentTime < buildTime(checkTime.start) &&
            status === "Present"
          ) {
            status = "Undertime";
            undertime = getTimeDifference(
              buildTime(checkTime.start),
              currentTime
            );
          } else if (currentTime > buildTime(checkTime.end)) {
            status = "Overtime";
            overtime = getTimeDifference(
              currentTime,
              buildTime(checkTime.start)
            );
          }
          break; // Exit the loop after finding the applicable role
        }
      }

      body.clock_out = current;
      body.undertime = undertime;
      body.overtime = overtime;
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
  async getAll(req, res, next) {
    try {
      const store = new Store(req.db);
      result = await store.getAll();
      if (!result) {
        result = [];
      }
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

module.exports = AttendaceService;
