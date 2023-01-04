import http from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../types/socket.interface";

const connectSocketIO = (server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
	const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
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

export default connectSocketIO;
