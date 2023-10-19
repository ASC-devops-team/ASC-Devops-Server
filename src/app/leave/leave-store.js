const moment = require("moment-timezone");
const TableConfig = require("../../configuration/leaveConfig");

class LeaveStore {
  constructor(db) {
    this.db = db;
    this.table = TableConfig.tableName;
    this.cols = TableConfig.columnNames;
  }

  // CREATE
  async add(userId, body) {
    try {
      const result = await this.db(this.table).insert({
        name: body.name,
        date: body.date,
        type: body.type,
        date_from: body.date_from,
        date_to: body.date_to,
        duration: body.duration,
        vacation_count: body.vacation_count,
        sick_count: body.sick_count,
        reason: body?.reason,
        leave_form: body?.leave_form,
        status: body.status,
        user_id: userId,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get Table data
  async getData(startDate, endDate) {
    try {
      let query = this.db(this.table).select().orderBy(this.cols.date, "desc");
      if (startDate && endDate) {
        query = query.whereBetween(this.cols.date, [startDate, endDate]);
      }
      const results = await query;
      const convertedResults = convertDatesToTimezone(
        results.map((row) => row),
        [
          this.cols.date,
          this.cols.createdAt,
          this.cols.updatedAt,
          this.cols.dateFrom,
          this.cols.dateTo,
        ]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  // // GET EXISTING
  // async getByUerIdAndDate(userId, date) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const result = await this.db(this.table)
  //         .select()
  //         .where(this.cols.userid, userId)
  //         .andWhere(this.cols.date, date)
  //         .first();
  //       if (result) {
  //         resolve(result);
  //       } else {
  //         resolve(null);
  //       }
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // }

  // // UPDATE
  // async update(body) {
  //   await this.db(this.table).where(this.cols.id, body.uuid).update({
  //     clock_out: body.clock_out,
  //     undertime: body.undertime,
  //     overtime: body.overtime,
  //     status: body.status,
  //     total_work_hours: body.work_hours,
  //   });
  //   const updatedRows = await this.db(this.table)
  //     .where(this.cols.id, body.uuid)
  //     .select("*")
  //     .first();
  //   return updatedRows;
  // }

  // // READ
  // async getById(uuid) {
  //   const results = await this.db(this.table)
  //     .select()
  //     .where(this.cols.id, uuid);
  //   return results;
  // }

  // // DELETE
  // async delete(uuid) {
  //   const deletedRows = await this.db(this.table)
  //     .where(this.cols.id, uuid)
  //     .select("*")
  //     .first();
  //   await this.db(this.table).where(this.cols.id, uuid).del();
  //   return deletedRows;
  // }
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

module.exports = LeaveStore;
