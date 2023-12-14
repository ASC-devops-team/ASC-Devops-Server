const EventStore = require("./event-store");
const Logs = require("../logs/logs-store");
const { NotFoundError, BadRequestError } = require("../../middlewares/errors");

class EventService {
  // Submit Leave
  async add(req, res, next) {
    try {
      const eventStore = new EventStore(req.db);
      const body = req.body;
      const result = await eventStore.add(body);
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
      const eventStore = new EventStore(req.db);
      const result = await eventStore.getData();
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
      const eventStore = new EventStore(req.db);
      const uuid = req.params.uuid;
      //const userId = req.auth.id; // Get user ID using auth
      const result = await eventStore.delete(uuid);
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
}

module.exports = EventService;
