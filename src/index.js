"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var app_1 = require("./app");
require("dotenv/config");
var http_1 = require("http");
var socket_1 = require("./services/socket");
var server = http_1["default"].createServer(app_1["default"]);
var PORT = process.env.PORT || 3004;
app_1["default"].listen(PORT, function () {
    (0, socket_1["default"])(server);
    console.log("Server is listening on: http://localhost:".concat(PORT));
});
var DB_URI = process.env.DB_URI;
mongoose_1["default"].set("strictQuery", true);
mongoose_1["default"]
    .connect(DB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(function (data) { return console.log("Connected to database"); })["catch"](function (error) { return console.log(error.message); });
