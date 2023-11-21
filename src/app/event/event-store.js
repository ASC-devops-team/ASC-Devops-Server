const moment = require("moment-timezone");
const TableConfig = require("../../configuration/leaveConfig");

class EventStore {
  constructor(db) {
    this.db = db;
    this.table = TableConfig.tableName;
    this.cols = TableConfig.columnNames;
  }

  // CREATE
  async add(body) {
    try {
      const result = await this.db("events").insert({
        title: body?.title,
        date: body?.date,
        allDay: body?.allDay,
        type: body?.type,
        user_id: body?.user_id,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get Table data
  async getData() {
    try {
      let query = this.db("events").select();
      const results = await query;
      const convertedResults = convertDatesToTimezone(
        results.map((row) => row),
        ["date", "created_at", "updated_at"]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  // DELETE
  async delete(uuid) {
    try {
      // Remove the unnecessary select("*").first() line
      const deletedRows = await this.db("events").where("uuid", uuid).del();
      return deletedRows;
    } catch (error) {
      console.error("Error deleting row:", error);
      throw error; // Re-throw the error to be handled by the calling code
    }
  }
}

function formatDate(dateString) {
  const date = moment(dateString, "YYYY/MM/DD", true);
  if (!date.isValid()) {
    return "";
  } // code from TAD reports
  return date.format("YYYY-MM-DD");
}

function convertDatesToTimezone(rows, dateFields) {
  return rows.map((row) => {
    const convertedFields = {};
    dateFields.forEach((field) => {
      const originalDate = row[field];

      // Check if the date field is null
      if (originalDate === null) {
        convertedFields[field] = null;
      } else {
        // Convert non-null date to the desired format
        const convertedDate = moment
          .utc(originalDate)
          .tz("Asia/Singapore")
          .format("YYYY-MM-DD");
        convertedFields[field] = convertedDate;
      }
    });
    return { ...row, ...convertedFields };
  });
}

module.exports = EventStore;
