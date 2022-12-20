"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./src/app"));
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./src/services/socket"));
const server = http_1.default.createServer(app_1.default);
const PORT = process.env.PORT || 3004;
app_1.default.listen(PORT, () => {
    (0, socket_1.default)(server);
    console.log(`Server is listening on: http://localhost:${PORT}`);
});
const DB_URI = process.env.DB_URI;
mongoose_1.default.set("strictQuery", true);
mongoose_1.default
    .connect(DB_URI)
    .then((data) => {
    // console.log(data);
    console.log("Connected to database");
})
    .catch((error) => console.log(error.message));
