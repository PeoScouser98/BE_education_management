import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import redisClient from '../../database/redis';
import { UserRoleEnum } from '../../types/user.type';
import { AuthRedisKeyPrefix } from '../../types/redis.type';
import { HttpStatusCode } from '../../configs/statusCode.config';
import { HttpException } from '../../types/httpException.type';

export const checkAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.cookies.uid) throw createHttpError.BadRequest('Invalid auth id!');
		const accessTokenKey = AuthRedisKeyPrefix.ACCESS_TOKEN + req.cookies.uid;
		const storedAccessToken = await redisClient.get(accessTokenKey);
		if (!storedAccessToken) throw createHttpError.Forbidden();

		const accessToken = req.cookies.access_token;
		if (!accessToken) throw createHttpError.Forbidden();

		const { payload } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;

		req.profile = payload;
		req.role = payload.role;
		next();
	} catch (error: any) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const checkIsHeadmaster = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.role !== UserRoleEnum.HEADMASTER) {
			throw createHttpError.Forbidden('Only headmaster allowed to access!');
		}
		next();
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const checkIsTeacher = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.role !== UserRoleEnum.HEADMASTER || req.role !== UserRoleEnum.HEADMASTER) {
			return res.status(HttpStatusCode.FORBIDDEN).json({
				message: 'Only teacher/headmaster allowed to access!',
				statusCode: HttpStatusCode.FORBIDDEN,
			});
		}
		next();
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};
