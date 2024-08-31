"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = exports.pool = void 0;
var pg = require("pg");
var expressSession = require("express-session");
var connectPgSimple = require("connect-pg-simple");
var dotEnv = require("dotenv");
var Pool = pg.Pool;
var pgSession = connectPgSimple(expressSession);
dotEnv.config();
var dbOptions = {
    host: process.env.DB_HOST_DEV,
    port: parseInt(process.env.DB_PORT_DEV),
    user: process.env.DB_USER_DEV,
    password: process.env.DB_PASSWORD_DEV,
    database: process.env.DB_NAME_DEV,
    ssl: process.env.NODE_ENV === "development" ? false : { rejectUnauthorized: false },
    min: 0,
    idleTimeoutMillis: 0,
};
var pool = new Pool(dbOptions);
exports.pool = pool;
pool.on("error", function (err) {
    console.log("Encountered error", err);
});
var sessionStore = new pgSession({
    pool: pool,
    tableName: "sessions",
    createTableIfMissing: true,
});
exports.sessionStore = sessionStore;
