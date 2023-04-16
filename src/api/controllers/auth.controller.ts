import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { MongooseError } from 'mongoose';
import path from 'path';
import '../../app/googlePassport';
import redisClient from '../../database/redis';
import { AuthRedisKeyPrefix } from '../../types/redis.type';
import { IUser } from '../../types/user.type';
import UserModel from '../models/user.model';
import { authenticator } from '@otplib/preset-default';
import qrcode from 'qrcode';

export const signinWithGoogle = async (req: Request, res: Response) => {
	try {
		const user = req.profile as Partial<IUser>;
		const accessToken = jwt.sign({ payload: req.profile }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '1h',
		});

		const refreshToken = jwt.sign({ payload: req.profile }, process.env.REFRESH_TOKEN_SECRET!, {
			expiresIn: '30d',
		});

		await Promise.all([
			redisClient.set(AuthRedisKeyPrefix.ACCESS_TOKEN + user._id, accessToken, {
				EX: 60 * 60, // 1 hour
			}),
			redisClient.set(AuthRedisKeyPrefix.REFRESH_TOKEN + user._id, refreshToken, {
				EX: 60 * 60 * 24 * 30, // 1 month
			}),
		]);

		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000 * 24, // 1 day
			httpOnly: true,
			// secure: false,
		});
		res.cookie('uid', user._id?.toString().trim(), {
			maxAge: 60 * 60 * 1000 * 24 * 30, // 30 days
			httpOnly: true,
			// secure: false,
		});

		return res.redirect(`${process.env.CLIENT_URL}/signin/success`);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const signinWithPhoneNumber = async (req: Request, res: Response) => {
	try {
		const user = req.profile as Partial<IUser>;
		const accessToken = jwt.sign({ payload: user }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '1h',
		});
		const refreshToken = jwt.sign({ payload: user }, process.env.REFRESH_TOKEN_SECRET!, {
			expiresIn: '30d',
		});

		await Promise.all([
			redisClient.set(AuthRedisKeyPrefix.ACCESS_TOKEN + user._id, accessToken, {
				EX: 60 * 60, // 1 hour
			}),
			redisClient.set(AuthRedisKeyPrefix.REFRESH_TOKEN + user._id, refreshToken, {
				EX: 60 * 60 * 24 * 30, // 1 month
			}),
		]);

		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000 * 24, // 1 day
			httpOnly: true,
			// secure: false,
		});
		res.cookie('uid', user._id?.toString().trim(), {
			maxAge: 60 * 60 * 1000 * 24 * 30, // 30 days
			httpOnly: true,
			// secure: false,
		});
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError | JsonWebTokenError).message,
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
			AuthRedisKeyPrefix.REFRESH_TOKEN + req.cookies.uid
		);

		if (!storedRefreshToken) {
			throw createHttpError.BadRequest('Invalid refresh token!');
		}
		const decoded = jwt.verify(
			storedRefreshToken,
			process.env.REFRESH_TOKEN_SECRET!
		) as JwtPayload;
		if (!decoded) {
			throw createHttpError.Forbidden('Invalid');
		}
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
		console.log(req.cookies.uid);
		const existedUser = await UserModel.findOne({
			_id: req.cookies.uid,
		}).exec();
		if (!existedUser) {
			throw createHttpError.NotFound("User doesn't exist");
		}
		const userRedisTokenKeys = {
			accessToken: AuthRedisKeyPrefix.ACCESS_TOKEN + req.cookies.uid,
			refreshToken: AuthRedisKeyPrefix.REFRESH_TOKEN + req.cookies.uid,
		};
		const accessToken = await redisClient.get(userRedisTokenKeys.accessToken);

		if (!accessToken)
			return res.status(400).json({
				message: 'Failed to revoke token',
				statusCode: 400,
			});
		// Delete user's access & refresh token in Redis
		await Promise.all([
			redisClient.del(userRedisTokenKeys.accessToken),
			redisClient.del(userRedisTokenKeys.refreshToken),
		]);
		// Reset all client's cookies
		req.logout((err) => {
			if (err) throw err;
		});
		res.clearCookie('access_token');
		res.clearCookie('uid');
		res.clearCookie('connect.sid', { path: '/' });

		return res.status(202).json({
			message: 'Signed out!',
			statusCode: 202,
		});
	} catch (error) {}
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
export const forgotPassword = async () => {
	try {
		// handle logic ...
	} catch (error) {
		// handle errors
	}
};
export const sendOtp = async (req: Request, res: Response) => {
	try {
		const existedUser = await UserModel.findOne({ phone: req.body.phone });
		if (!existedUser) {
			throw createHttpError.NotFound(`User's phone number does not exist!`);
		}

		const secret = authenticator.generateSecret(); // base32 encoded hex secret key
		const token = authenticator.generate(secret);
		await redisClient.set(AuthRedisKeyPrefix.OTP_KEY + existedUser._id, token, { EX: 60 * 60 });
		qrcode.toDataURL(token, (err, imageUrl) => {
			if (err) {
				throw createHttpError.InternalServerError('Fail to generate QR code');
			}
			return res.status(200).json({
				qrcodeImageUrl: imageUrl,
				uid: existedUser._id,
			});
		});
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error | MongooseError).message,
			statusCode: (error as HttpError).status,
		});
	}
};

export const verifyUserByPhone = async (req: Request, res: Response) => {
	try {
		if (!req.body.verifyCode) {
			throw createHttpError.BadRequest('Verify code must be provided!');
		}
		const code = await redisClient.get(AuthRedisKeyPrefix.OTP_KEY + req.params.userId);
		if (!code) {
			throw createHttpError.Gone('Code is expired!');
		}
		if (req.body.verifyCode === code) {
			await redisClient.del(AuthRedisKeyPrefix.OTP_KEY + req.params.userId);
			return res.redirect(process.env.CLIENT_URL! + '/reset-password');
		} else {
			return res.status(400).json({
				message: 'Incorrect verify code!',
				statusCode: 400,
			});
		}
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error | MongooseError).message,
			statusCode: (error as HttpError).status,
		});
	}
};

export const resetPassword = async () => {
	try {
		// handle logic ...
	} catch (error) {
		// handle errors
	}
};
