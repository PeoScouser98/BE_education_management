import mongoose, { ObjectId } from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';
import '../../app/passport';
import redisClient from '../../app/redis';
import { privateKey, publicKey } from '../../helpers/readKeys';
import UserModel, { User } from '../models/user.model';
/**
 * @description sign in as head master role using email & password
 * @returns {Partial<User>}
 */

export const signinWithPhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = jwt.sign({ auth: req.user }, privateKey, {
			algorithm: 'RS256',
			expiresIn: '30m',
		});
		const refreshToken = jwt.sign({ auth: req.user }, process.env.REFRESH_TOKEN_SECRET!, {
			expiresIn: '30d',
		});

		await Promise.all([
			redisClient.set(`access_token__${(req.user as Partial<User>)._id}`, accessToken, {
				EX: 60 * 60,
			}),
			redisClient.set(`refresh_token__${(req.user as Partial<User>)._id}`, refreshToken, {
				EX: 60 * 60 * 24 * 30,
			}),
		]);
		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
		});
		res.cookie('authId', JSON.stringify((req.user as Partial<User>)._id), {
			maxAge: 60 * 60 * 1000 * 24 * 30,
		});

		res.cookie(
			'user',
			() => {
				delete (req.user as Partial<User>)._id;
				delete (req.user as Partial<User>).password;
				return JSON.stringify(req.user);
			},
			{
				maxAge: 60 * 60 * 1000,
			}
		);
		res.status(200).json({
			accessToken: accessToken,
			refreshToken: refreshToken,
			user: req.user,
		});
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

		const accessToken = jwt.sign({ auth: (req.user as User)._id }, privateKey, {
			algorithm: 'RS256',
			expiresIn: '30m',
		});

		const refreshToken = jwt.sign(
			{ auth: (req.user as User)._id },
			process.env.REFRESH_TOKEN_SECRET!,
			{
				expiresIn: '30d',
			}
		);
		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
			secure: true,
		});
		res.cookie('authId', user._id!.toString(), {
			httpOnly: true,
			secure: true,
		});
		const { _id: _, ...rest } = user;
		res.cookie('user', JSON.stringify(rest));

		await Promise.all([
			redisClient.set(`access_token__${user._id}`, accessToken, {
				EX: 60 * 60,
			}),
			redisClient.set(`refresh_token__${user._id}`, refreshToken, {
				EX: 60 * 60 * 24 * 30,
			}),
		]);

		return user.role === 'HEADMASTER'
			? res.redirect(`${process.env.CLIENT_URL}/headmaster/dashboard`)
			: res.redirect(`${process.env.CLIENT_URL}/teacher/dashboard`);
	} catch (error) {
		return res.status(400).json({
			message: 'Failed to signin!',
			statusCode: 400,
		});
	}
};

export const refreshToken = async (req: Request, res: Response) => {
	try {
		const existedUser = await UserModel.exists({ _id: req.params.userId });
		if (!existedUser) {
			throw createHttpError.NotFound('Invalid user!');
		}
		const newAccessToken = jwt.sign({ auth: req.params.userId }, privateKey, {
			algorithm: 'RS256',
			expiresIn: '1h',
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
		res.cookie('access_token', '');
		res.cookie('authId', '');
		res.cookie('user', '');

		return res.status(202).json({
			message: 'Signed out!',
			statusCode: 202,
		});
	} catch (error) {
		return res.status(400).json({
			message: 'Failed to signout!',
			statusCode: 400,
		});
	}
};
