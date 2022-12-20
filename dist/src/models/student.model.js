"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const studentSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        require: true,
    },
    gender: {
        type: Boolean,
        require: true,
    },
    dateOfBirth: {
        type: Date,
        require: true,
        default: new Date(),
    },
    class: {
        type: mongoose_1.Types.ObjectId,
        ref: "Classes",
    },
    schoolYear: {
        type: String,
        require: true,
    },
    parentPhoneNumber: {
        type: String,
        require: true,
    },
});
const Student = (0, mongoose_1.model)("Students", studentSchema);
exports.default = Student;
