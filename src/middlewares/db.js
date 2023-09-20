const knex = require("knex");
const passwordOptions = ["1234"]; // Define your password options
let db = null; // Initialize the database connection variable

async function connectToDatabase() {
  for (const password of passwordOptions) {
    try {
      db = knex({
        client: "mysql2",
        connection: {
          host: "127.0.0.1",
          port: 3306,
          user: "root",
          password: password,
          database: "misasc",
        },
        pool: {
          min: 1, // Minimum number of connections
          max: 100, // Maximum number of connections
        },
      });
      await db.raw("SELECT 1"); // Test the database connection

      // If the connection is successful, break out of the loop
      console.log(`Connection attempt with password '${password}' successful.`);
      break;
    } catch (error) {
      console.error(`Connection attempt with password '${password}' failed:`);
      db = null; // Reset the database connection variable
    }
  }

  if (!db) {
    console.error(
      "All connection attempts failed. Could not connect to the database."
    );
  }
}

connectToDatabase();

// Export the database middleware for use in other parts of your application
module.exports = (req, res, next) => {
  req.db = db;
  next();
};

// const knex = require("knex")({
//   client: "mysql2",
//   connection: {
//     host: "127.0.0.1",
//     port: 3306,
//     user: "root",
//     password: "macmac",
//     // password: "macmac",
//     // password: "philfilda",
//     // password: "philfida",
//     // password: "macmac",
//     database: "earth",
//   },
//   pool: {
//     min: 2, // Minimum number of connections
//     max: 100, // Maximum number of connections
//   },
// });

// const db = (req, res, next) => {
//   req.db = knex;
//   next();
// };

// module.exports = db;
