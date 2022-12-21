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

const databaseUri = process.env.NODE_ENV === "PRODUCTION" ? process.env.DB_URI! : process.env.DB_LOCAL_URI!;
mongoose.set("strictQuery", true);
mongoose
	.connect(databaseUri)
	.then((data) => {
		console.log("Connected to database");
	})
	.catch((error) => console.log(error.message));
