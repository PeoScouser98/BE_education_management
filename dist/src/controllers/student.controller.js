"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.list = void 0;
// import Student from "../models/student.model";
const student_model_1 = __importDefault(require("../models/student.model"));
const http_errors_1 = __importDefault(require("http-errors"));
// import "express-async-errors";
const list = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield student_model_1.default.find().exec();
        if (!students)
            throw http_errors_1.default.NotFound("Cannot find any student!");
        return res.status(200).json(students);
    }
    catch (error) {
        return res.status(error.status).json({
            message: error.message,
        });
    }
});
exports.list = list;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newStudent = yield new student_model_1.default(req.body).save();
        return res.status(201).json(newStudent);
    }
    catch (error) {
        return res.status(error.status).json({
            message: error.message,
        });
    }
});
exports.create = create;
