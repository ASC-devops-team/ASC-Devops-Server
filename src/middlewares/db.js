require("dotenv").config();

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 2, // Minimum number of connections
    max: 100, // Maximum number of connections
  },
});

const db = (req, res, next) => {
  req.db = knex;
  next();
};

module.exports = db;