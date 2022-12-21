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
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const connectMongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const isProductionEnv = ((_a = process.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.indexOf("production")) != -1;
        console.log("Node ENV:>>", isProductionEnv);
        const databaseUri = isProductionEnv ? process.env.DB_URI : process.env.LOCAL_DB_URI;
        mongoose_1.default.set("strictQuery", true);
        yield mongoose_1.default.connect(databaseUri);
        console.log("Connected to database");
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.default = connectMongoDB;
