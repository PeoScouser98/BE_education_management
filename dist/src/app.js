"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const student_route_1 = __importDefault(require("./routes/student.route"));
const app = (0, express_1.default)();
// * Using middlewares
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("tiny"));
// * Using router
app.use("/api", student_route_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Server now is running!",
    });
});
exports.default = app;
