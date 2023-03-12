import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { publicKey } from '../../helpers/readKeys';
import redisClient from '../../app/redis';

export const checkAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.cookies.authId) throw createHttpError.BadRequest('Invalid auth id!');

		const storedAccessToken = await redisClient.get(`access_token__${req.cookies.authId}`);
		if (!storedAccessToken) throw createHttpError.Unauthorized();

		const accessToken = req.cookies['access_token'];
		if (!accessToken) throw createHttpError.Forbidden('Access token must be provided!');

		const decoded = jwt.verify(accessToken, publicKey, {
			algorithms: ['RS256'],
		}) as JwtPayload;

		req.auth = (decoded as JwtPayload).auth?._id;
		req.role = (decoded as JwtPayload).auth.role;
		next();
	} catch (error) {
		return res.status(401).json({
			message: (error as JsonWebTokenError).message,
			statusCode: 401,
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
		if (req.role !== 'TEACHER') {
			return res.status(403).json({
				message: 'Only teacher allowed to access!',
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
