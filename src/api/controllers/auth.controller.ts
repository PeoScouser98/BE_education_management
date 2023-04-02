import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { MongooseError } from 'mongoose';
import path from 'path';
import '../../app/googlePassport';
import redisClient from '../../database/redis';
import UserModel from '../models/user.model';
import { IUser } from '../../types/user.type';

export const signinWithGoogle = async (req: Request, res: Response) => {
	try {
		const user = req.user as Partial<IUser>;
		const accessToken = jwt.sign({ payload: req.user }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '1h',
		});

		const refreshToken = jwt.sign({ payload: req.user }, process.env.REFRESH_TOKEN_SECRET!, {
			expiresIn: '30d',
		});

		await Promise.all([
			redisClient.set(`access_token__${user._id}`, accessToken, {
				EX: 60 * 60,
			}),
			redisClient.set(`refresh_token__${user._id}`, refreshToken, {
				EX: 60 * 60 * 24 * 30,
			}),
		]);

		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
			secure: false,
		});
		res.cookie('credential', user._id?.toString().trim(), {
			maxAge: 60 * 60 * 1000 * 24 * 365,
			httpOnly: true,
			secure: false,
		});

		return res.redirect(`${process.env.CLIENT_URL}/signin/success`);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
export const getUser = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw createHttpError.NotFound(`Failed to get user's info`);
		}

		return res.status(200).json(req.user);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status,
		});
	}
};
export const refreshToken = async (req: Request, res: Response) => {
	try {
		const storedRefreshToken = await redisClient.get(
			`refresh_token__${req.cookies.credential}`
		);
		if (!storedRefreshToken) {
			throw createHttpError.BadRequest('Invalid refresh token!');
		}
		const decoded = jwt.verify(
			storedRefreshToken,
			process.env.REFRESH_TOKEN_SECRET!
		) as JwtPayload;

		const newAccessToken = jwt.sign(decoded, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '30m',
		});
		await redisClient.set(req.params.userId, newAccessToken);
		return res.status(200).json({
			refreshToken: newAccessToken,
			statusCode: 200,
			message: 'ok',
		});
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError | JsonWebTokenError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const signout = async (req: Request, res: Response) => {
	try {
		console.log(req.cookies.credential);
		const existedUser = await UserModel.findOne({
			_id: req.cookies.credential,
		}).exec();
		if (!existedUser) {
			throw createHttpError.NotFound("User doesn't exist");
		}
		const accessToken = await redisClient.get(`access_token__${req.cookies.credential}`);

		if (!accessToken)
			return res.status(400).json({
				message: 'Failed to revoke token',
				statusCode: 400,
			});
		// Delete user's access & refresh token in Redis
		await Promise.all([
			redisClient.del(`access_token__${req.cookies.credential}`),
			redisClient.del(`refresh_token__${req.cookies.credential}`),
		]);
		// Reset all client's cookies
		req.logout((err) => {
			if (err) throw err;
		});
		res.cookie('access_token', '');
		res.cookie('credential', '');
		res.cookie('user', '');

		return res.status(202).json({
			message: 'Signed out!',
			statusCode: 202,
		});
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.query.token as string;
		if (!token) {
			throw createHttpError.Unauthorized('Access token must be provided!');
		}
		const { auth } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
		const updateUserData =
			req.query.user_type === 'teacher'
				? { isVerified: true, employmentStatus: true }
				: { isVerified: true };
		await UserModel.findOneAndUpdate({ email: auth }, updateUserData, {
			new: true,
		});

		return res.sendFile(path.resolve(path.join(__dirname, '../views/send-mail-response.html')));
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | JsonWebTokenError | Error).message,
			statusCode: (error as HttpError).status,
		});
	}
};
