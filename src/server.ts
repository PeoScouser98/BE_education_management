import app from "./app";
import "dotenv/config";
import http from "http";
import connectSocketIO from "./app/socket";
import connectMongoDB from "./configs/db.config";

const server = http.createServer(app);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
    console.log(`[SUCCESS] ::: Server is listening on: http://localhost:${PORT}`);
    connectSocketIO(server);
});

connectMongoDB();
