import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { HttpStatusCode } from '../../configs/statusCode.config';
import { IUser, UserRoleEnum } from '../../types/user.type';
import getVerificationEmailTemplate from '../emails/verifyUserEmail';
import { sendVerificationEmail } from '../services/mail.service';
import * as UserService from '../services/user.service';
import { HttpException } from './../../types/httpException.type';
import {
	validateNewParentsData,
	validateNewTeacherData,
	validateUpdateUserData,
} from './../validations/user.validation';

export const createTeacherAccount = async (req: Request, res: Response) => {
	try {
		const { error } = validateNewTeacherData(req.body);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}
		const newUser = (await UserService.createUser({
			payload: { ...req.body, role: UserRoleEnum.TEACHER },
			multi: false,
		})) as IUser;

		const token = jwt.sign({ auth: newUser.email }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '7d',
		});
		const domain = req.protocol + '://' + req.get('host');
		await sendVerificationEmail({
			to: req.body.email,
			subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
			template: getVerificationEmailTemplate({
				redirectDomain: domain,
				user: { ...req.body, role: UserRoleEnum.TEACHER },
				token,
			}),
		});
		return res.status(HttpStatusCode.CREATED).json(newUser);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [POST] /users/create-parents-account
export const createParentsAccount = async (req: Request, res: Response) => {
	try {
		const isMulti = req.query.multi || false;

		const { error, value } = validateNewParentsData({
			payload: req.body,
			multi: Boolean(isMulti),
		});

		if (error) throw createHttpError.BadRequest(error.message);

		const payload = Array.isArray(value)
			? value.map((user) => ({
					...user,
					role: UserRoleEnum.PARENTS,
			  }))
			: {
					...value,
					role: UserRoleEnum.PARENTS,
			  };

		// Create multiple or single parent user depending on type of payload and multi optional value
		const newParents = await UserService.createUser({
			payload,
			multi: Boolean(isMulti),
		});

		const domain = req.protocol + '://' + req.get('host');

		// send verification mail to multiple users
		if (isMulti && Array.isArray(payload)) {
			const sendMailPromises = [];

			for (let i = 0; i < payload.length; i++) {
				sendMailPromises.push(
					new Promise((resolve, reject) => {
						const token = jwt.sign(
							{ auth: payload.at(i)?.email },
							process.env.ACCESS_TOKEN_SECRET!,
							{
								expiresIn: '7d',
							}
						);
						sendVerificationEmail({
							to: payload.at(i)?.email,
							subject:
								'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
							template: getVerificationEmailTemplate({
								redirectDomain: domain,
								token: token,
								user: payload.at(i),
							}),
						})
							.then((info) => resolve(info))
							.catch((error) => reject(error));
					})
				);
			}
			await Promise.all(sendMailPromises);
		}
		// Send mail for one user
		else {
			const token = jwt.sign({ auth: payload?.email }, process.env.ACCESS_TOKEN_SECRET!, {
				expiresIn: '7d',
			});
			sendVerificationEmail({
				to: payload?.email,
				subject:
					'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
				template: getVerificationEmailTemplate({
					redirectDomain: domain,
					token: token,
					user: payload,
				}),
			});
		}

		return res.status(HttpStatusCode.CREATED).json(newParents);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [PATCH] /
export const updateUserInfo = async (req: Request, res: Response) => {
	try {
		const { error } = validateUpdateUserData(req.body);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		const updatedUser = await UserService.updateUserInfo(req.profile?._id as string, req.body);
		if (!updatedUser) {
			throw createHttpError.BadRequest('User does not exist!');
		}
		return res.status(HttpStatusCode.CREATED).json(updatedUser);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /users/teachers?is_verified=true&employment_status=false
export const getTeachersByStatus = async (req: Request, res: Response) => {
	try {
		const { status } = req.query;

		const teachers = await UserService.getTeacherUsersByStatus(status as string | undefined);
		if (!teachers) {
			throw createHttpError.NotFound('Không thể tìm thấy giáo viên nào!');
		}
		return res.status(HttpStatusCode.OK).json(teachers);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [PATCH] /
export const deactivateTeacherAccount = async (req: Request, res: Response) => {
	try {
		const deactivatedTeacher = await UserService.deactivateTeacherUser(req.params.userId);
		if (!deactivatedTeacher) {
			throw createHttpError.NotFound('Cannot find teacher to deactivate!');
		}
		return res.status(HttpStatusCode.CREATED).json(deactivatedTeacher);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const getParentsUserByClass = async (req: Request, res: Response) => {
	try {
		const parents = await UserService.getParentsUserByClass(req.params.classId);
		return res.status(HttpStatusCode.OK).json(parents);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const searchParentsUsers = async (req: Request, res: Response) => {
	try {
		const result = await UserService.searchParents(req.body.searchTerm);
		if (!result) throw createHttpError.NotFound('Cannot find any parents account!');
		return res.status(HttpStatusCode.OK).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const getUserDetails = async (req: Request, res: Response) => {
	try {
		const user = await UserService.getUserDetails(req.params.id);
		if (!user) throw createHttpError.NotFound('User not found!');
		return res.status(HttpStatusCode.OK).json(user);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};
