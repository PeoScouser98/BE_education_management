import app from './app';
import 'dotenv/config';
import http from 'http';
import connectSocketIO from './app/socket';
import connectMongoDB from './database/mongodb';
import './database/redis';
import './core/global';

const server = http.createServer(app);

const PORT = process.env.PORT || 3004;

server.listen(PORT, () => {
	console.log(`[SUCCESS] ::: Server is listening on port: ${PORT}`);
	console.log(`[INFO] ::: API document available on: http://localhost:${PORT}/api/document`);
});

connectSocketIO(server);
connectMongoDB();
