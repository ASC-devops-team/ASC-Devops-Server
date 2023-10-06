const { query } = require("express");
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
        const result = await this.db("attendance").insert({
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
        const result = await this.db("attendance")
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
  async getAll() {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.db("attendance")
          .select()
          .orderBy([{ column: "created_at", order: "desc" }]);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  // UPDATE
  async update(body) {
    await this.db(this.table).where(this.cols.id, body.uuid).update({
      clock_out: body.clock_out,
      undertime: body.undertime,
      overtime: body.overtime,
      status: body.status,
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

module.exports = AttendanceStore;
