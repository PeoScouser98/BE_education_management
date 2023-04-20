import { refreshToken } from './../api/controllers/auth.controller';
import 'dotenv/config';
import * as redis from 'redis';
import { redisOptions } from '../configs/redis.config';

const redisClient = redis.createClient();

redisClient
	.connect()
	.then(() => {
		console.log('[SUCCESS] ::: Connected to Redis');
	})
	.catch((error) => {
		console.log('[ERROR] ::: ', error.message);
	});

export default redisClient;
