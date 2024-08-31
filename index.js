"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
var port = 3000;
app.get("/", function (req, res) {
    res.send("Hello world");
});
app.listen(port, function () { return console.log("Server listening at port 3000"); });
