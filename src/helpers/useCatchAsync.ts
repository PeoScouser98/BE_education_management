import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../types/httpException.type';

const useCatchAsync = (fn: Function) => (req: Request, res: Response, next?: NextFunction) =>
	Promise.resolve(fn(req, res, next)).catch((error) => {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	});

export default useCatchAsync;
