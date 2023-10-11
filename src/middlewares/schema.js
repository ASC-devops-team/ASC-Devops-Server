const db = require("./db");
const asyncHandler = require("express-async-handler");

const userDao =
  (db,
  asyncHandler(async (req, res, next) => {
    const hasTable = async () => {
      try {
        await req.db.raw("SELECT * FROM users LIMIT 1");
        return true;
      } catch (error) {
        return false;
      }
    };

    const createTable = async () => {
      try {
        await req.db.schema
          .createTable("users", async (table) => {
            table.increments("uuid").primary();
            table.string("email").notNullable().unique();
            table.string("password").notNullable();
            table.string("firstname").notNullable();
            table.string("middlename").notNullable();
            table.string("lastname").notNullable();
            table.string("suffix").nullable();
            table.string("maidenname").nullable();
            table.string("access_level").notNullable();
            table.string("position").notNullable();
            table.date("date_hired").notNullable();
            table.date("birthday").notNullable();
            table.string("civil_status").notNullable();
            table.string("contact_number").notNullable();
            table.string("address").notNullable();
            table.string("sss").notNullable();
            table.string("tin").notNullable();
            table.string("hdmf").notNullable();
            table.string("philhealth").notNullable();
            table.string("emergency_contact_person").nullable();
            table.string("emergency_contact_number").nullable();
            table.string("qr_code").nullable();
            table.string("fingerprint").nullable();
            table.string("avatar").notNullable().defaultTo("default");
            table.integer("status").notNullable().defaultTo(1);
            table.string("refresh_token").nullable();
            table.timestamps(true, true);
            table.index("qr_code");
          })

          .createTable("attendance", (table) => {
            table.increments("uuid").primary();
            table.date("date").notNullable();
            table.string("name").notNullable();
            table.string("setting").nullable();
            table.time("clock_in").nullable();
            table.time("clock_out").nullable();
            table.time("late").nullable();
            table.time("undertime").nullable();
            table.time("overtime").nullable();
            table.time("total_work_hours").nullable();
            table.string("status").nullable();
            table
              .integer("user_id")
              .unsigned()
              .nullable()
              .references("uuid")
              .inTable("users")
              .onDelete("CASCADE");
            table.index("date");
            table.index("name");
          })

          .createTable("leave", (table) => {
            table.increments("uuid").primary();
            table.string("name").notNullable();
            table.timestamps(true, true);
            table.string("type").notNullable();
            table.date("date_from").notNullable();
            table.date("date_to").notNullable();
            table.integer("duration").notNullable();
            table.integer("vacation_count").notNullable();
            table.integer("sick_count").notNullable();
            table.string("reason").notNullable();
            table
              .integer("user_id")
              .unsigned()
              .nullable()
              .references("uuid")
              .inTable("users")
              .onDelete("CASCADE");
            table
              .integer("attendance_id")
              .unsigned()
              .notNullable()
              .references("uuid")
              .inTable("attendance")
              .onDelete("CASCADE");
            table.index("name");
          })

          .createTable("logs", (table) => {
            table.increments("log_id").primary();
            table
              .integer("user_id")
              .unsigned()
              .references("uuid")
              .inTable("users")
              .onDelete("RESTRICT");
            table
              .enu("module", [
                "Authentication",
                "Nursery",
                "Projects",
                "Products",
                "Purchase Request",
                "Canvass",
                "Cart",
                "Purchase Order",
                "Categories",
                "Suppliers",
                "Brands",
              ])
              .notNullable();
            table.string("action").notNullable();
            table.json("data").nullable();
            table.string("ip_address").nullable();
            table.string("operating_system").nullable();
            table.string("session_id").nullable();
            table.text("user_agent").nullable();
            table.timestamps(true, true);
          });

        // .createTable("brand", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("name").notNullable();
        //   table.timestamps(true, true);
        //   table.index("name");
        // })

        // .createTable("category", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("name").notNullable();
        //   table.timestamps(true, true);
        //   table.index("name");
        // })

        // .createTable("supplier", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("name").notNullable();
        //   table.string("address").notNullable();
        //   table.string("phone_no").notNullable();
        //   table.string("mobile_no").notNullable();
        //   table.string("tin_no").notNullable();
        //   table.timestamps(true, true);
        //   table.index("name");
        // })

        // .createTable("product", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("name").notNullable();
        //   table.string("item_code").notNullable();
        //   table.double("price").notNullable();
        //   table
        //     .integer("brand_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid") // Change this to "uuid" to match the primary key of "users" table
        //     .inTable("brand")
        //     .onDelete("CASCADE");
        //   table
        //     .integer("category_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid") // Change this to "uuid" to match the primary key of "users" table
        //     .inTable("category")
        //     .onDelete("CASCADE");
        //   table
        //     .integer("supplier_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid") // Change this to "uuid" to match the primary key of "users" table
        //     .inTable("supplier")
        //     .onDelete("CASCADE");
        //   table.string("description").nullable();
        //   table.timestamps(true, true);
        //   table
        //     .integer("added_by")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid") // Change this to "uuid" to match the primary key of "users" table
        //     .inTable("users")
        //     .onDelete("CASCADE");
        //   table.index("item_code");
        //   table.index("price");
        //   table.index("name");
        //   table.index("description");
        // })

        // .createTable("projects", (table) => {
        //   table.increments("uuid").primary();
        //   table.date("start_date").notNullable();
        //   table.date("end_date").notNullable();
        //   table.string("project_name").notNullable();
        //   table.double("cost").notNullable();
        //   table.timestamps(true, true);
        //   table
        //     .integer("added_by")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid") // Change this to "uuid" to match the primary key of "users" table
        //     .inTable("users")
        //     .onDelete("CASCADE");
        // })

        // .createTable("canvass", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("name").notNullable();
        //   table.string("item_code").notNullable();
        //   table.integer("quantity").defaultTo(1).notNullable();
        //   table.double("price").notNullable();
        //   table.string("description").nullable();
        //   table.timestamps(true, true);
        //   table
        //     .foreign("item_code")
        //     .references("item_code")
        //     .inTable("product");
        //   table.index("item_code");
        // })

        // .createTable("purchase_item", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("item_code").notNullable();
        //   table.string("ref_code").notNullable();
        //   table.double("price").notNullable();
        //   table.integer("quantity").notNullable();
        //   table
        //     .integer("product_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid")
        //     .inTable("product")
        //     .onDelete("RESTRICT");
        //   table
        //     .integer("brand_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid")
        //     .inTable("brand")
        //     .onDelete("RESTRICT");
        //   table
        //     .integer("supplier_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid")
        //     .inTable("supplier")
        //     .onDelete("RESTRICT");
        //   table
        //     .integer("category_id")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid")
        //     .inTable("category")
        //     .onDelete("RESTRICT");
        //   table.string("description").nullable();
        //   table.timestamps(true, true);
        //   table.foreign("price").references("price").inTable("product");
        //   table
        //     .foreign("item_code")
        //     .references("item_code")
        //     .inTable("product");
        //   table.index("price");
        //   table.index("item_code");
        // })

        // .createTable("purchase", (table) => {
        //   table.increments("uuid").primary();
        //   table.string("ref_code").notNullable();
        //   table.string("pr_code").nullable();
        //   table.string("po_code").nullable();
        //   table.string("tf_code").nullable();
        //   table.string("or_code").nullable();
        //   table.string("process_type").nullable().defaultTo("request");
        //   table.string("pr_status").notNullable().defaultTo("pending");
        //   table.string("po_status").notNullable().defaultTo("pending");
        //   table.string("tf_status").notNullable().defaultTo("pending");
        //   table.string("company_name").notNullable().defaultTo("Earth");
        //   table
        //     .string("address")
        //     .notNullable()
        //     .defaultTo("3rd planet, Solar System, Milky Way Galaxy");
        //   table.integer("item_count").notNullable();
        //   table.double("total_amount");
        //   table.string("terms_of_agreement").nullable(); //manual
        //   table.string("purpose").nullable(); //maunal
        //   table.string("unit").nullable(); //manual
        //   table.string("attention").nullable(); //manual
        //   table.string("remarks").nullable(); //manual
        //   table.date("request_date").nullable();
        //   table.date("order_date").nullable();
        //   table.date("order_due_date").nullable();
        //   table.date("transmit_date").nullable();
        //   table.date("billing_date").nullable();
        //   table.date("prepared_date").nullable();
        //   table.date("received_date").nullable();
        //   table.string("prepared_by").nullable(); //manual
        //   table.string("received_by").nullable(); //manual
        //   table.string("noted_by").nullable(); //manual
        //   table.timestamps(true, true);
        // })

        // .createTable("nursery", (table) => {
        //   table.increments("uuid").primary();
        //   table.date("report_date").notNullable();
        //   table.string("nurseries").notNullable();
        //   table.string("funded_by").notNullable();
        //   table.string("region").notNullable();
        //   table.string("province").notNullable();
        //   table.string("district").nullable();
        //   table.string("municipality").notNullable();
        //   table.string("barangay").notNullable();
        //   table.date("birthdate").notNullable();
        //   table.integer("age").notNullable();
        //   table.string("name_of_cooperative_individual").notNullable();
        //   table.string("gender").notNullable();
        //   table.date("date_established").notNullable();
        //   table.double("area_in_hectares_ha").notNullable();
        //   table.string("variety_used").notNullable();
        //   table.integer("period_of_moa").notNullable();
        //   table.string("remarks").nullable();
        //   table.timestamps(true, true);
        //   table
        //     .integer("added_by")
        //     .unsigned()
        //     .notNullable()
        //     .references("uuid")
        //     .inTable("users")
        //     .onDelete("RESTRICT");
        // })

        await req.db("users").insert([
          {
            email: "raymond.hernandez@asc.com.ph",
            password:
              "$2a$12$yFR3vYP2w9odValFIuuNYeZNfAie0tLmy5x6fH1NKw38ftIKMBKCe",
            firstname: "Raymond",
            middlename: "Anabe",
            lastname: "Hernandez",
            maidenname: "Martin",
            access_level: "Super Admin",
            position: "IT developer specialist",
            date_hired: "2023-07-01",
            birthday: "1996-07-17",
            civil_status: "Single",
            contact_number: "09255233919",
            address:
              "Blk 12 Lot 44 Gwapito St. Springville Garden III, Phase 1, Molino IV, Imus, Cavite",
            sss: "1656516214",
            tin: "5467347",
            hdmf: "9647847",
            philhealth: "243532652",
            emergency_contact_person: "09255233919",
            emergency_contact_number: "09255233919",
          },
          {
            email: "ian.salita@asc.com.ph",
            password:
              "$2a$12$yFR3vYP2w9odValFIuuNYeZNfAie0tLmy5x6fH1NKw38ftIKMBKCe",
            firstname: "Ian",
            middlename: "Speak",
            lastname: "Salita",
            maidenname: "Talk",
            access_level: "Super Admin",
            position: "IT supervisor",
            date_hired: "2023-07-01",
            birthday: "1992-07-17",
            civil_status: "Single",
            contact_number: "09255233919",
            address:
              "Blk 12 Lot 44 Gwapito St. Springville Garden III, Phase 1, Molino IV, Imus, Cavite",
            sss: "1656516214",
            tin: "5467347",
            hdmf: "9647847",
            philhealth: "243532652",
            emergency_contact_person: "09255233919",
            emergency_contact_number: "09255233919",
          },
          {
            email: "johnpaul.miraflores@asc.com.ph",
            password:
              "$2a$12$yFR3vYP2w9odValFIuuNYeZNfAie0tLmy5x6fH1NKw38ftIKMBKCe",
            firstname: "John Paul",
            middlename: "Chixboy",
            lastname: "Miraflores",
            maidenname: "Heartbreaker",
            access_level: "Admin",
            position: "IT developer specialist",
            date_hired: "2023-07-01",
            birthday: "1998-07-17",
            civil_status: "Single",
            contact_number: "09255233919",
            address:
              "Blk 12 Lot 44 Gwapito St. Springville Garden III, Phase 1, Molino IV, Imus, Cavite",
            sss: "1656516214",
            tin: "5467347",
            hdmf: "9647847",
            philhealth: "243532652",
            emergency_contact_person: "09255233919",
            emergency_contact_number: "09255233919",
          },
        ]);
      } catch (error) {
        console.error("Error creating user tables:", error);
        throw new Error("Error creating user tables");
      }
    };

    const main = async () => {
      try {
        if (!(await hasTable())) {
          await createTable();
        }
        req.userDao = userDao;
        next();
      } catch (error) {
        console.error("Error creating user tables:", error);
        return res.status(500).send({ error: "Error creating user tables" });
      }
    };

    main();
  }));

module.exports = userDao;
