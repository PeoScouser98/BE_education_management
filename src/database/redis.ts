import * as redis from 'redis';
import 'dotenv/config';
import { RedisClientOptions } from 'redis';

const redisClientOption = process.env.NODE_ENV?.includes('production')
	? { username: process.env.REDIS_USERNAME, password: process.env.REDIS_PASSWORD }
	: (process.env.REDIS_URI as RedisClientOptions);
1;

const redisClient = redis.createClient({
	username: process.env.REDIS_USERNAME,
	password: process.env.REDIS_PASSWORD,
});

redisClient
	.connect()
	.then(() => {
		console.log('[SUCCESS] Connected to Redis');
	})
	.catch((error) => {
		console.log(error.message);
	});

export default redisClient;
