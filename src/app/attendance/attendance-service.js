const Store = require("./attendance-store");
const Logs = require("../logs/logs-store");
const { NotFoundError } = require("../../middlewares/errors");

class AttendaceService {
  // CLOCK IN
  async add(req, res, next) {
    const current = new Date();
    const sevenAM = new Date();
    sevenAM.setHours(7, 0, 0, 0);
    const eightAM = new Date();
    eightAM.setHours(8, 0, 0, 0);

    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const body = req.body;
      const userRole = req.query.userRole; // Assuming you have defined userRole

      // Assuming you have defined currentTime and userData elsewhere
      const currentTime = current.getTime(); // Get current time in milliseconds
      // Calculate the time difference between current time and 8 AM
      const timeDifferenceMs = currentTime - eightAM.getTime();
      const lateHours = Math.floor(timeDifferenceMs / (60 * 60 * 1000)); // Hours
      const lateMinutes = Math.floor(
        (timeDifferenceMs % (60 * 60 * 1000)) / (60 * 1000)
      );
      const lateSeconds = Math.floor((timeDifferenceMs % (60 * 1000)) / 1000); // Seconds
      // Format the late time as a string (e.g., "4:05:23")
      const lateTime = `${lateHours}:${lateMinutes}:${lateSeconds}`;

      // Set the late time in the body
      body.clock_in = current;
      body.date = current;
      body.late = lateTime;

      // Determine the status based on userRole and currentTime
      if (
        (userRole === "user" && currentTime < sevenAM.getTime()) ||
        (userRole === "superadmin" && currentTime < eightAM.getTime())
      ) {
        body.status = "Present";
      } else {
        body.status = "Late";
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

  // CLOCK OUT
  async update(req, res, next) {
    try {
      const store = new Store(req.db);
      // const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = {
        clock_out: new Date(),
      };
      const result = await store.update(uuid, body);
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

module.exports = AttendaceService;
