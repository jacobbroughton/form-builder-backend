import pg from "pg";
import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotEnv from "dotenv";

const { Pool } = pg;
const pgSession = connectPgSimple(expressSession);

dotEnv.config();

const dbOptions = {
  host: process.env.DB_HOST_DEV,
  port: parseInt(process.env.DB_PORT_DEV!),
  user: process.env.DB_USER_DEV,
  password: process.env.DB_PASSWORD_DEV,
  database: process.env.DB_NAME_DEV,
  ssl: process.env.NODE_ENV === "development" ? false : { rejectUnauthorized: false },
  min: 0,
  idleTimeoutMillis: 0,
};

const pool = new Pool(dbOptions);

pool.on("error", (err) => {
  console.log("Encountered error", err);
});

const sessionStore = new pgSession({
  pool: pool,
  tableName: "sessions",
  createTableIfMissing: true,
});

export { pool, sessionStore };
