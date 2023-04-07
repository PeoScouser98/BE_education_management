import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import redisClient from '../../database/redis';

export const checkAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.cookies.credential) throw createHttpError.BadRequest('Invalid auth id!');

		const storedAccessToken = await redisClient.get(`access_token__${req.cookies.credential}`);
		if (!storedAccessToken) throw createHttpError.Forbidden();

		const accessToken = req.cookies.access_token;
		if (!accessToken) throw createHttpError.Forbidden();

		const { payload } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
		req.user = payload;
		req.role = payload.role;
		next();
	} catch (error) {
		return res.status((error as HttpError).status || 401).json({
			message: (error as JsonWebTokenError | HttpError).message,
			statusCode: (error as HttpError).status,
		});
	}
};

export const checkIsHeadmaster = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.role !== 'HEADMASTER') {
			throw createHttpError.Forbidden('Only headmaster allowed to access!');
		}
		next();
	} catch (error) {
		return res.status(403).json({
			message: (error as JsonWebTokenError).message,
			statusCode: 403,
		});
	}
};

export const checkIsTeacher = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.role !== 'TEACHER' || req.role !== 'HEADMASTER') {
			return res.status(403).json({
				message: 'Only teacher/headmaster allowed to access!',
				statusCode: 403,
			});
		}
		next();
	} catch (error) {
		return res.status(401).json({
			message: (error as JsonWebTokenError).message,
			statusCode: 401,
		});
	}
};
