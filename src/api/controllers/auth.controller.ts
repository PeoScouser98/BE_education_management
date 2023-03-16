import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import '../../app/passport';
import redisClient from '../../app/redis';
import UserModel, { User } from '../models/user.model';
import { authenticateUser } from './../services/auth.service';

/**
 * @description sign in as head master role using email & password
 * @returns {Partial<User>}
 */

export const signinWithPhoneOrEmail = async (req: Request, res: Response) => {
	try {
		const verifyData = req.body.phone || req.body.email;
		const user = await authenticateUser(verifyData as string);
		console.log(user);
		const accessToken = jwt.sign(
			{ payload: { id: user._id, role: user.role } },
			process.env.ACCESS_TOKEN_SECRET!,
			{
				expiresIn: '30m',
			}
		);
		const refreshToken = jwt.sign(
			{ payload: { id: user._id, role: user.role } },
			process.env.REFRESH_TOKEN_SECRET!,
			{
				expiresIn: '30d',
			}
		);

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
		});
		res.cookie('authId', user.toObject()._id, {
			maxAge: 60 * 60 * 1000 * 24 * 30,
		});
		const { _id: _, ...rest } = user;
		res.cookie('user', rest, {
			maxAge: 60 * 60 * 1000,
		});
		res.status(200).json({ user, accessToken, refreshToken });
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const signinWithGoogle = async (req: Request, res: Response) => {
	try {
		const user = req.user as Partial<User>;

		const accessToken = jwt.sign(
			{ payload: { id: user._id, role: user.role } },
			process.env.ACCESS_TOKEN_SECRET!,
			{
				expiresIn: '1h',
			}
		);

		const refreshToken = jwt.sign(
			{ payload: { id: user._id, role: user.role } },
			process.env.REFRESH_TOKEN_SECRET!,
			{
				expiresIn: '30d',
			}
		);

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
			secure: true,
		});
		res.cookie('authId', user._id!, {
			httpOnly: true,
			secure: true,
		});

		const { _id: _, ...rest } = user;
		res.cookie('user', JSON.stringify(rest));

		switch (user.role) {
			case 'HEADMASTER':
				res.redirect(`${process.env.CLIENT_URL}/headmaster/dashboard`);
				break;
			case 'TEACHER':
				res.redirect(`${process.env.CLIENT_URL}/teacher/dashboard`);
				break;
			case 'PARENTS':
				res.redirect(`${process.env.CLIENT_URL}/parents/dashboard`);
				break;
		}
	} catch (error) {
		console.log((error as Error).message);
		return res.status(400).json({
			message: 'Failed to signin!',
			statusCode: 400,
		});
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	try {
		const storedRefreshToken = await redisClient.get(`refresh_token__${req.params.userId}`);
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
		// handle errors
	}
};

export const signout = async (req: Request, res: Response) => {
	try {
		console.log(req.cookies.authId);
		const existedUser = await UserModel.findOne({
			_id: req.cookies.authId,
		}).exec();
		if (!existedUser) {
			throw createHttpError.NotFound("User doesn't exist");
		}
		const accessToken = await redisClient.get(`access_token__${req.cookies.authId}`);

		if (!accessToken)
			return res.status(400).json({
				message: 'Failed to revoke token',
				statusCode: 400,
			});
		// Delete user's access & refresh token in Redis
		await Promise.all([
			redisClient.del(`access_token__${req.cookies.authId}`),
			redisClient.del(`refresh_token__${req.cookies.authId}`),
		]);
		// Reset all client's cookies
		req.logout((err) => {
			if (err) throw err;
		});
		res.cookie('access_token', '');
		res.cookie('authId', '');
		res.cookie('user', '');

		return res.status(202).json({
			message: 'Signed out!',
			statusCode: 202,
		});
	} catch (error) {
		return res.status(400).json({
			message: (error as Error).message,
			statusCode: 400,
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
		return res.send('kích hoạt tài khoản thành công!');
	} catch (error) {
		return res.status(401).json({
			message: (error as HttpError | JsonWebTokenError | Error).message,
			statusCode: (error as HttpError).status,
		});
	}
};
