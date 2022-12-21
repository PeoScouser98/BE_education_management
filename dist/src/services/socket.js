"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const connectSocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            // origin: "http://localhost:3000", //* base url from front end
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        },
    });
    io.on("connection", (socket) => {
        console.log("User connected:>>", socket.id);
        socket.on("disconnect", () => console.log("User disconnected!"));
    });
};
exports.default = connectSocketIO;
