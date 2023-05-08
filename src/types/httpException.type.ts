import { HttpError, isHttpError } from 'http-errors';
import { MongooseError } from 'mongoose';
import { HttpStatusCode } from '../configs/statusCode.config';

interface ErrorResponse {
	message: string;
	statusCode: number;
}

export class HttpException implements ErrorResponse {
	message: string;
	statusCode: number;

	constructor(error: HttpError | MongooseError | Error | any) {
		this.message = error.message;
		this.statusCode = isHttpError(error) ? error.status : HttpStatusCode.INTERNAL_SERVER_ERROR;
	}
}
