const moment = require("moment-timezone");

class BalanceStore {
  constructor(db) {
    this.db = db;
  }

  // CREATE
  async add(body) {
    try {
      const [uuid] = await this.db("leave_balance")
        .insert({
          validity: body?.validity,
          user_id: body?.user_id,
        })
        .onConflict("validity")
        .merge();
      const result = await this.db("leave_balance").where("uuid", uuid).first();
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getBalance(userId, lastDayOfYear) {
    try {
      const query = this.db("leave_balance")
        .select()
        .where("user_id", userId)
        .andWhere("validity", lastDayOfYear)
        .first();
      const results = await query;
      return results;
    } catch (error) {
      throw error;
    }
  }

  // UPDATE
  async updateBalance(body) {
    try {
      const result = await this.db("leave_balance")
        .update({
          sl: body?.sl,
          vl: body?.vl,
          used_leaves: body?.used_leaves,
          validity: body?.validity,
          user_id: body?.user_id,
        })
        .where("user_id", body?.user_id)
        .andWhere("validity", body?.validity);
      return result;
    } catch (error) {
      throw error;
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

module.exports = BalanceStore;
