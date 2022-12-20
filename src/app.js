"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var morgan_1 = require("morgan");
var student_route_1 = require("./routes/student.route");
var app = (0, express_1["default"])();
// * Using middlewares
app.use(express_1["default"].json());
app.use((0, cors_1["default"])());
app.use((0, morgan_1["default"])("tiny"));
// * Using router
app.use("/api", student_route_1["default"]);
app.get("/", function (req, res) {
    res.send("Server now is running!");
});
exports["default"] = app;
