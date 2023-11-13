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
        leave_type: body?.leave_type,
        day_type: body?.day_type,
        date_from: body.date_from,
        date_to: body.date_to,
        duration: body.duration,
        vl_balance: body.vl_balance,
        sl_balance: body.sl_balance,
        reason: body?.reason,
        status: body.status,
        remarks: body?.remarks,
        processing: body?.processing,
        reviewed_by: body?.reviewed_by,
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
      let query = this.db(this.table).select().orderBy(this.cols.id, "desc");
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
          this.cols.dateApproved,
          this.cols.dateRejected,
        ]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  async getDataByUser(userId) {
    try {
      let query = this.db(this.table)
        .select()
        .where(this.cols.userId, userId)
        .orderBy(this.cols.id, "desc");
      const results = await query;
      const convertedResults = convertDatesToTimezone(
        results.map((row) => row),
        [
          this.cols.date,
          this.cols.createdAt,
          this.cols.updatedAt,
          this.cols.dateFrom,
          this.cols.dateTo,
          this.cols.dateApproved,
          this.cols.dateRejected,
        ]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  // Stat Count
  async getStatCount(toCount, startDate, endDate) {
    try {
      const result = await this.db(this.table)
        .count()
        .where(this.cols.status, "like", `%${toCount}%`)
        .whereBetween("date", [startDate, endDate]);
      const statCount = result[0]["count(*)"] || 0;
      return statCount;
    } catch (error) {
      throw error;
    }
  }

  // UPDATE
  async update(body) {
    try {
      const result = await this.db(this.table)
        .update({
          name: body?.name,
          date: body?.date,
          leave_type: body?.leave_type,
          day_type: body?.day_type,
          date_from: body?.date_from,
          date_to: body?.date_to,
          date_approved: body?.date_approved,
          date_rejected: body?.date_rejected,
          duration: body?.duration,
          vl_balance: body?.vl_balance,
          sl_balance: body?.sl_balance,
          reason: body?.reason,
          decision: body?.decision,
          status: body?.status,
          remarks: body?.remarks,
          processing: body?.processing,
          reviewed_by: body?.reviewed_by,
        })
        .where(this.cols.id, body?.uuid);
      return result;
    } catch (error) {
      throw error;
    }
  }

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

module.exports = LeaveStore;
