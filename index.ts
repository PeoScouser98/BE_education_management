import app from "./src/app";
import "dotenv/config";
import http from "http";
import connectSocketIO from "./src/services/socket";
import connectMongoDB from "./src/configs/db.config";

const server = http.createServer(app);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
	console.log(`Server is listening on: http://localhost:${PORT}`);
	connectSocketIO(server);
});

connectMongoDB();
