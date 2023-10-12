const moment = require("moment-timezone");
const TableConfig = require("../../configuration/userTableConfig");

class UserStore {
  constructor(db) {
    this.db = db;
    this.table = TableConfig.tableName;
    this.cols = TableConfig.columnNames;
  }

  async getUsername(email) {
    return await this.db("users").where("email", email).first();
  }

  async registerUser(body, hash) {
    return await this.db("users").insert({
      firstname: body.firstname,
      lastname: body.lastname,
      position: body.position,
      email: body.email,
      password: hash,
      access_level: body.access_level,
    });
  }

  async updateUser(uuid, body, hash) {
    return await this.db("users").where("UUID", uuid).update({
      // email: body.email,
      // password: hash,
      firstname: body.firstname,
      lastname: body.lastname,
      // region: body.region,
      access_level: body.access_level,
      // refresh_token: body.refresh_token,
      status: body.status,
    });
  }

  async updateUserPersonal(uuid, body, hash) {
    return await this.db("users").where("UUID", uuid).update({
      firstname: body?.firstname,
      middlename: body?.middlename,
      lastname: body?.lastname,
      suffix: body?.suffix,
      maidenname: body?.maidenname,
      access_level: body?.access_level,
      email: body?.email,
      position: body?.position,
      date_hired: body?.date_hired,
      birthday: body?.birthday,
      civil_status: body?.civil_status,
      contact_number: body?.contact_number,
      address: body?.address,
      sss: body?.sss,
      tin: body?.tin,
      hdmf: body?.hdmf,
      philhealth: body?.philhealth,
      emergency_contact_person: body?.emergency_contact_person,
      emergency_contact_number: body?.emergency_contact_number,
      qr_code: body?.qr_code,
      fingerprint: body?.fingerprint,
      avatar: body?.avatar,
      status: body?.status,
      // refresh_token: body.refresh_token,
    });
  }
  async updateUserAccount(uuid, body, hash) {
    return await this.db("users").where("UUID", uuid).update({
      // email: body.email,
      password: hash,
      // firstname: body.firstname,
      // lastname: body.lastname,
      // region: body.region,
      // access_level: body.access_level,
      // refresh_token: body.refresh_token,
      // status: body.status,
    });
  }

  async updateRefreshToken(uuid, body, refreshtoken) {
    return await this.db("users").where("UUID", uuid).update({
      email: body.email,
      password: body.password,
      firstname: body.firstname,
      lastname: body.lastname,
      // region: body.region,
      access_level: body.access_level,
      refresh_token: refreshtoken,
      status: body.status,
    });
  }

  async getUserByQR(qrCode) {
    const result = await this.db(this.table)
      .select()
      .where(this.cols.qrCode, qrCode)
      .first();
    return result;
  }

  // READS
  async getData() {
    try {
      let query = this.db(this.table)
        .select()
        .orderBy([
          { column: "status", order: "desc" },
          { column: "firstname" },
        ]);
      const results = await query;
      const convertedResults = convertDatesToTimezone(
        results.map((row) => row),
        [this.cols.dateHired, this.cols.birthday]
      );
      return convertedResults;
    } catch (error) {
      throw error;
    }
  }

  async search(search) {
    const query = this.db(this.table)
      .select()
      .orderBy([{ column: this.cols.id, order: "asc" }]);
    if (search) {
      const columns = await this.db(this.table).columnInfo();
      query.andWhere((builder) => {
        builder.where((innerBuilder) => {
          Object.keys(columns).forEach((column) => {
            innerBuilder.orWhere(column, "like", `%${search}%`);
          });
        });
      });
    }
    const results = await query;
    return results;
  }

  // async deleteUser(uuid) {
  //   return await this.db('users')
  //     .where('UUID', uuid)
  //     .del();
  // }
}

function convertDatesToTimezone(rows, dateFields) {
  return rows.map((row) => {
    const convertedFields = {};
    dateFields.forEach((field) => {
      if (row[field]) {
        const convertedDate = moment(row[field]).format("YYYY-MM-DD");
        convertedFields[field] = convertedDate;
      } else {
        // If the field is null or undefined, keep it as-is
        convertedFields[field] = row[field];
      }
    });
    return { ...row, ...convertedFields };
  });
}

module.exports = UserStore;
