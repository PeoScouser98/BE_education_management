"use strict";
exports.__esModule = true;
var express_1 = require("express");
var student_controller_1 = require("../controllers/student.controller");
var router = express_1["default"].Router();
router.get("/students", student_controller_1.list);
exports["default"] = router;
