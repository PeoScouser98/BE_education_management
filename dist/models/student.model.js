"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const studentSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        // require: true,
    },
    gender: {
        type: Boolean,
        // require: true,
    },
    dateOfBirth: {
        type: Date,
        // require: true,
        default: new Date(),
    },
    class: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Classes",
    },
    schoolYear: {
        type: String,
        // require: true,
    },
    parentPhoneNumber: {
        type: String,
        // require: true,
    },
});
const Student = mongoose_1.default.model("Students", studentSchema);
exports.default = Student;
