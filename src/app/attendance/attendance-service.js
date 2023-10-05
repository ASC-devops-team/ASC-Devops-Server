const Store = require("./attendance-store");
const Logs = require("../logs/logs-store");
const { NotFoundError } = require("../../middlewares/errors");

class AttendaceService {
  // CLOCK IN
  async add(req, res, next) {
    const current = new Date();
    const currentTime = current.getTime(); // Get current time in milliseconds
    const sevenAM = new Date();
    sevenAM.setHours(7, 0, 0, 0);
    const eightAM = new Date();
    eightAM.setHours(8, 0, 0, 0);

    try {
      const store = new Store(req.db);
      // const logs = new Logs(req.db);
      const body = req.body;
      const userRole = req.query.userRole; // Assuming you have defined userRole
      let status = null;
      let late = null;

      // Determine the status based on userRole and currentTime
      if (userRole === "user" && currentTime < sevenAM.getTime()) {
        status = "Present";
        late = getLateTime(sevenAM.getTime(), currentTime);
      }
      if (userRole === "superadmin" && currentTime < eightAM.getTime()) {
        status = "Present";
        late = getLateTime(eightAM.getTime(), currentTime);
      } else {
        status = "Late";
      }

      // Set the late time in the body
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
    const current = new Date();
    const currentTime = current.getTime(); // Get current time in milliseconds
    const fourPM = new Date();
    fourPM.setHours(16, 0, 0, 0);
    const fivePM = new Date();
    fivePM.setHours(17, 0, 0, 0);
    const sixPM = new Date();
    sixPM.setHours(18, 0, 0, 0);

    try {
      const store = new Store(req.db);
      const body = req.body;
      const userRole = req.query.userRole; // Assuming you have defined userRole

      let undertime = null;
      let overtime = null;
      let status = body.status;

      // Determine the status based on userRole and currentTime
      if (userRole === "user" && currentTime < fourPM.getTime()) {
        status = `${status} & Undertime`;
        undertime = getUndertime(fourPM.getTime(), currentTime);
      } else if (
        userRole === "user" &&
        currentTime > fivePM.getTime() &&
        status === "Present"
      ) {
        status = "Overtime";
        overtime = getOvertime(fourPM.getTime(), currentTime);
      }
      if (userRole === "superadmin" && currentTime < fivePM.getTime()) {
        status = `${status} & Undertime`;
        undertime = getUndertime(fivePM.getTime(), currentTime);
      } else if (
        userRole === "superadmin" &&
        currentTime > sixPM.getTime() &&
        status === "Present"
      ) {
        status = "Overtime";
        overtime = getOvertime(fivePM.getTime(), currentTime);
      } else {
        status = body.status;
      }

      body.clock_out = current;
      // body.total_hours = totalHoursWorked;
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
      console.log(userId);
      console.log(date);
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

function getOvertime(time, currentTime) {
  // Calculate the time difference between current time and 8 AM
  const timeDifferenceMs = currentTime - time;
  const hours = Math.floor(timeDifferenceMs / (60 * 60 * 1000)); // Hours
  const minutes = Math.floor(
    (timeDifferenceMs % (60 * 60 * 1000)) / (60 * 1000)
  );
  const seconds = Math.floor((timeDifferenceMs % (60 * 1000)) / 1000); // Seconds
  // Format the late time as a string (e.g., "4:05:23")
  return (time = `${hours}:${minutes}:${seconds}`);
}

function getUndertime(time, currentTime) {
  // Calculate the time difference between current time and 8 AM
  const timeDifferenceMs = time - currentTime;
  const hours = Math.floor(timeDifferenceMs / (60 * 60 * 1000)); // Hours
  const minutes = Math.floor(
    (timeDifferenceMs % (60 * 60 * 1000)) / (60 * 1000)
  );
  const seconds = Math.floor((timeDifferenceMs % (60 * 1000)) / 1000); // Seconds
  // Format the late time as a string (e.g., "4:05:23")
  return (time = `${hours}:${minutes}:${seconds}`);
}

function getLateTime(time, currentTime) {
  // Calculate the time difference between current time and 8 AM
  const timeDifferenceMs = currentTime - time;
  const hours = Math.floor(timeDifferenceMs / (60 * 60 * 1000)); // Hours
  const minutes = Math.floor(
    (timeDifferenceMs % (60 * 60 * 1000)) / (60 * 1000)
  );
  const seconds = Math.floor((timeDifferenceMs % (60 * 1000)) / 1000); // Seconds
  // Format the late time as a string (e.g., "4:05:23")
  return (time = `${hours}:${minutes}:${seconds}`);
}

module.exports = AttendaceService;
