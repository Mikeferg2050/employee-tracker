const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "MikeMike420!",
  database: "employee_tracker",
  port: 5432,
});

module.exports = pool;
