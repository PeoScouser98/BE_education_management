import mongoose from "mongoose";
import app from "./src/app";
import "dotenv/config";
import http from "http";
import connectSocketIO from "./src/services/socket";

const server = http.createServer(app);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
	connectSocketIO(server);
	console.log(`Server is listening on: http://localhost:${PORT}`);
});

const DB_URI = process.env.DB_URI!;
mongoose.set("strictQuery", true);
mongoose
	.connect(DB_URI)
	.then((data) => {
		// console.log(data);
		console.log("Connected to database");
	})
	.catch((error) => console.log(error.message));
