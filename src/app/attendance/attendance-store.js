const moment = require("moment-timezone");
const TableConfig = require("../../configuration/attendanceConfig");

class AttendanceStore {
  constructor(db) {
    this.db = db;
    this.table = TableConfig.tableName;
    this.cols = TableConfig.columnNames;
  }

  // CREATE
  async clockin(body) {
    try {
      const result = await this.db(this.table).insert({
        date: body?.date,
        name: body?.name,
        setting: body?.setting,
        clock_in: body?.clock_in,
        clock_out: body?.clock_out,
        late: body?.late,
        undertime: body?.undertime,
        overtime: body?.overtime,
        status: body?.status,
        user_id: body?.user_id,
        leave_id: body?.leave_id,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // GET EXISTING
  async getByUserIdAndDate(userId, date) {
    try {
      const result = await this.db(this.table)
        .select()
        .where(this.cols.userid, userId)
        .andWhere(this.cols.date, date)
        .first();
      if (result) {
        return result;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  // UPDATE (Clock Out)
  async clockout(body) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  // READS
  async getData(userId, startDate, endDate) {
    try {
      let query = this.db(this.table)
        .select()
        .orderBy([
          { column: "date", order: "desc" },
          { column: "clock_in", order: "desc" },
          { column: "clock_out", order: "desc" },
        ]);
      if (userId !== undefined && userId !== null && userId !== "") {
        query.where("user_id", userId);
      }
      if (startDate && endDate) {
        query.whereBetween("date", [startDate, endDate]);
      }
      const results = await query;
      // Filter out data with dates beyond the current date
      const currentDate = new Date();
      const filteredResults = results.filter((row) => {
        const rowDate = new Date(row.date);
        return rowDate <= currentDate;
      });
      const convertedResults = convertDatesToTimezone(
        filteredResults.map((row) => ({ ...row })),
        [this.cols.date]
      );
      return convertedResults;
    } catch (error) {
      // Add more specific error handling if needed
      throw error;
    }
  }

  // Stat Count
  async getStatCount(toCount, startDate, endDate) {
    try {
      const currentDate = new Date();
      const result = await this.db(this.table)
        .count()
        .where(this.cols.status, "like", `%${toCount}%`)
        .whereBetween("date", [startDate, endDate])
        .where("date", "<=", currentDate.toISOString());
      const statCount = result[0]["count(*)"] || 0;
      return statCount;
    } catch (error) {
      throw error;
    }
  }

  // Count Absent
  // async getAbsent() {
  //   try {
  //     const currentDate = new Date();
  //     const result = await this.db(this.table)
  //       .count()
  //       .where((builder) => {
  //         builder
  //           .where(this.cols.setting, "VL")
  //           .orWhere(this.cols.setting, "SL")
  //           .orWhere(this.cols.setting, "EL");
  //       })
  //       .whereRaw(`Date(${this.cols.date}) = ?`, [
  //         currentDate.toISOString().split("T")[0],
  //       ]);
  //     const lateCount = result[0]["count(*)"] || 0;
  //     return lateCount;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // UPDATE ATTENDANCE DTR
  async update(body) {
    try {
      const result = await this.db(this.table)
        .update({
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
        })
        .where("uuid", body.uuid);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // READ
  // async getById(uuid) {
  //   const results = await this.db(this.table)
  //     .select()
  //     .where(this.cols.id, uuid);
  //   return results;
  // }

  // DELETE
  async delete(data) {
    try {
      const deletedRows = await this.db(this.table)
        .select()
        .where("leave_id", data.uuid)
        .andWhere(this.cols.userid, data.user_id);
      await this.db(this.table)
        .where("leave_id", data.uuid)
        .andWhere(this.cols.userid, data.user_id)
        .del();
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

module.exports = AttendanceStore;
