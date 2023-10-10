const moment = require("moment-timezone");
const TableConfig = require("../../configuration/attendanceConfig");

class AttendanceStore {
  constructor(db) {
    this.db = db;
    this.table = TableConfig.tableName;
    this.cols = TableConfig.columnNames;
  }

  // CREATE
  async add(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.db(this.table).insert({
          date: body.date,
          name: body.name,
          setting: body.setting,
          clock_in: body.clock_in,
          clock_out: body.clock_out,
          late: body.late,
          undertime: body.undertime,
          overtime: body.overtime,
          status: body.status,
          user_id: body.user_id,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  // GET EXISTING
  async getByUerIdAndDate(userId, date) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.db(this.table)
          .select()
          .where(this.cols.userid, userId)
          .andWhere(this.cols.date, date)
          .first();
        if (result) {
          resolve(result);
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // READS
  async getData(startDate, endDate) {
    try {
      let query = this.db(this.table).select().orderBy("date", "desc");
      if (startDate && endDate) {
        query = query.whereBetween("date", [startDate, endDate]);
      }
      const results = await query;
      // Filter out data with dates beyond the current date
      const currentDate = new Date();
      const filteredResults = results.filter((row) => {
        const rowDate = new Date(row.date);
        return rowDate <= currentDate;
      });
      const convertedResults = convertDatesToTimezone(
        filteredResults.map((row) => row),
        [this.cols.date]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  // UPDATE
  async update(body) {
    await this.db(this.table).where(this.cols.id, body.uuid).update({
      clock_out: body.clock_out,
      undertime: body.undertime,
      overtime: body.overtime,
      status: body.status,
      total_work_hours: body.work_hours,
    });
    const updatedRows = await this.db(this.table)
      .where(this.cols.id, body.uuid)
      .select("*")
      .first();
    return updatedRows;
  }

  // READ
  async getById(uuid) {
    const results = await this.db(this.table)
      .select()
      .where(this.cols.id, uuid);
    return results;
  }

  // DELETE
  async delete(uuid) {
    const deletedRows = await this.db(this.table)
      .where(this.cols.id, uuid)
      .select("*")
      .first();
    await this.db(this.table).where(this.cols.id, uuid).del();
    return deletedRows;
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
      const convertedDate = moment
        .utc(row[field])
        .tz("Asia/Singapore")
        .format("YYYY-MM-DD");
      convertedFields[field] = convertedDate;
    });
    return { ...row, ...convertedFields };
  });
}

module.exports = AttendanceStore;
