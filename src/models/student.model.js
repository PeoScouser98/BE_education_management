"use strict";
exports.__esModule = true;
var mongoose_1 = require("mongoose");
var studentSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        require: true
    },
    gender: {
        type: Boolean,
        require: true
    },
    dateOfBirth: {
        type: Date,
        require: true
    },
    "class": {
        type: mongoose_1.Types.ObjectId,
        ref: "Classes"
    },
    schoolYear: {
        type: String,
        require: true
    },
    parentPhoneNumber: {
        type: String,
        require: true
    }
});
var Student = (0, mongoose_1.model)("Students", studentSchema);
exports["default"] = Student;
