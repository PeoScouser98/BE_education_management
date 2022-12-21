"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./src/app"));
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./src/services/socket"));
const db_config_1 = __importDefault(require("./src/configs/db.config"));
const server = http_1.default.createServer(app_1.default);
const PORT = process.env.PORT || 3004;
app_1.default.listen(PORT, () => {
    console.log(`Server is listening on: http://localhost:${PORT}`);
    (0, socket_1.default)(server);
});
(0, db_config_1.default)();
