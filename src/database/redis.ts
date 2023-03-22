import * as redis from 'redis';
import 'dotenv/config';

const redisClientOption = process.env.NODE_ENV?.includes('production')
	? { username: process.env.REDIS_USERNAME, password: process.env.REDIS_PASSWORD }
	: undefined;

const redisClient = redis.createClient(redisClientOption);

redisClient
	.connect()
	.then(() => {
		console.log('[SUCCESS] Connected to Redis');
	})
	.catch((error) => {
		console.log(error.message);
	});

export default redisClient;
