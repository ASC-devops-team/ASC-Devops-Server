const moment = require("moment-timezone");

class ApprovalRouteStore {
  constructor(db) {
    this.db = db;
  }

  // CREATE
  async add(body) {
    try {
      const result = await this.db("approval_route")
        .insert({
          name: body?.name,
          boss1: body?.boss1,
          boss1_name: body?.boss1_name,
          boss2: body?.boss2,
          boss2_name: body?.boss2_name,
          boss3: body?.boss3,
          boss3_name: body?.boss3_name,
          boss4: body?.boss4,
          boss4_name: body?.boss4_name,
        })
        .onConflict("name")
        .merge();
      return result;
    } catch (error) {
      throw error;
    }
  }

  // READS
  async getData() {
    try {
      let query = this.db("approval_route").select();
      const results = await query;
      return results;
    } catch (error) {
      throw error;
    }
  }

  // // GET EXISTING
  // async getByUerIdAndDate(userId, date) {
  //   try {
  //     const result = await this.db(this.table)
  //       .select()
  //       .where(this.cols.userid, userId)
  //       .andWhere(this.cols.date, date)
  //       .first();
  //     if (result) {
  //       return result;
  //     } else {
  //       return null;
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // // UPDATE
  // async update(body) {
  //   try {
  //     const result = await this.db(this.table)
  //       .update({
  //         name: body?.name,
  //         type: body?.type,
  //         brand: body?.brand,
  //         model: body?.model,
  //         serial_code: body?.serial_code,
  //         issued_date: body?.issued_date,
  //         returned_date: body?.returned_date,
  //         purchase_date: body?.purchase_date,
  //         purchase_price: body?.purchase_price,
  //         current_value: body?.current_value,
  //         current_value: body?.current_value,
  //         notes: body?.notes,
  //         status: body?.status,
  //         user_id: body?.user_id,
  //       })
  //       .where("uuid", body.uuid);
  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // // GET Leave Balance
  // async getLeaveCountByUserId(userId, leaveType) {
  //   try {
  //     const currentYear = new Date().getFullYear(); // Get the year from the current date
  //     const result = await this.db(this.table)
  //       .count()
  //       .where(this.cols.userid, userId)
  //       .andWhere(this.cols.status, leaveType)
  //       .whereRaw(`YEAR(${this.cols.date}) = ${currentYear}`);
  //     const leaveCount = result[0]["count(*)"] || 0;
  //     return leaveCount;
  //   } catch (error) {
  //     throw error; // Instead of using reject, you can throw the error for cleaner async/await handling
  //   }
  // }

  // READ
  // async getById(uuid) {
  //   const results = await this.db(this.table)
  //     .select()
  //     .where(this.cols.id, uuid);
  //   return results;
  // }

  // DELETE
  // async delete(uuid) {
  //   const deletedRows = await this.db(this.table)
  //     .where(this.cols.id, uuid)
  //     .select("*")
  //     .first();
  //   await this.db(this.table).where(this.cols.id, uuid).del();
  //   return deletedRows;
  // }
}

module.exports = ApprovalRouteStore;
