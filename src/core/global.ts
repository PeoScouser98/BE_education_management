/* eslint-disable @typescript-eslint/no-namespace */
import { Readable } from 'stream';

declare global {
	namespace Express {
		interface Request {
			[key: string]: any;
		}
	}
}
