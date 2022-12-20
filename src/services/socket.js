"use strict";
exports.__esModule = true;
var socket_io_1 = require("socket.io");
var connectSocketIO = function (server) {
    var io = new socket_io_1.Server(server, {
        cors: {
            // origin: "http://localhost:3000", //* base url from front end
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
        }
    });
    io.on("connection", function (socket) {
        console.log("User connected:>>", socket.id);
        socket.on("disconnect", function () { return console.log("User disconnected!"); });
    });
};
exports["default"] = connectSocketIO;
