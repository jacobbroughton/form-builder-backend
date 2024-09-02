"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var dotenv = require("dotenv");
var database_1 = require("./config/database");
var formItemTypes_1 = require("./routes/formItemTypes");
dotenv.config();
var app = express();
var origins = ["http://localhost:3000"];
app.options("*", cors({ credentials: true, origin: origins }));
app.use(cors({
    credentials: true,
    origin: origins,
}));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
app.use(session({
    store: database_1.sessionStore,
    secret: process.env.SESSION_SECRET,
    proxy: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // one day
        secure: process.env.NODE_ENV === "production",
        httpOnly: false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : false,
    },
}));
app.use('/form-item-types', formItemTypes_1.default);
var port = 3001;
app.listen(port, function () { return console.log("Server listening at port 3001"); });
