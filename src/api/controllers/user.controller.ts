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
	validateUpdateUserData
} from './../validations/user.validation';
import useCatchAsync from '../../helpers/useCatchAsync';

export const createTeacherAccount = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateNewTeacherData(req.body);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}
	const newUser = (await UserService.createUser({ ...req.body, role: UserRoleEnum.TEACHER })) as IUser;
	const token = jwt.sign({ auth: newUser.email }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '7d'
	});
	const domain = req.protocol + '://' + req.get('host');
	await sendVerificationEmail({
		to: req.body.email,
		subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
		template: getVerificationEmailTemplate({
			redirectDomain: domain,
			user: { ...req.body, role: UserRoleEnum.TEACHER },
			token
		})
	});
	return res.status(HttpStatusCode.CREATED).json(newUser);
});

// [POST] /users/create-parents-account
export const createParentsAccount = useCatchAsync(async (req: Request, res: Response) => {
	const isMulti = req.query.multi || false;

	const { error, value } = validateNewParentsData(req.body);

	if (error) throw createHttpError.BadRequest(error.message);

	const payload = Array.isArray(value)
		? value.map((user) => ({
				...user,
				role: UserRoleEnum.PARENTS
		  }))
		: {
				...value,
				role: UserRoleEnum.PARENTS
		  };

	// Create multiple or single parent user depending on type of payload and multi optional value
	const newParents = await UserService.createUser(payload);

	const domain = req.protocol + '://' + req.get('host');

	// send verification mail to multiple users
	if (isMulti && Array.isArray(payload)) {
		const sendMailPromises = payload.map(
			(recipient: Partial<IUser>) =>
				new Promise((resolve) => {
					const token = jwt.sign({ auth: recipient?.email }, process.env.ACCESS_TOKEN_SECRET!, {
						expiresIn: '7d'
					});
					sendVerificationEmail({
						to: recipient.email as string,
						subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
						template: getVerificationEmailTemplate({
							redirectDomain: domain,
							token: token,
							user: recipient as Pick<IUser, 'displayName' | 'role'>
						})
					})
						.then((info) => resolve(info))
						.catch((error) => resolve(error));
				})
		);

		await Promise.all(sendMailPromises);
	}
	// Send mail for one user
	else {
		const token = jwt.sign({ auth: payload?.email }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '7d'
		});
		sendVerificationEmail({
			to: payload?.email,
			subject: 'Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên',
			template: getVerificationEmailTemplate({
				redirectDomain: domain,
				token: token,
				user: payload
			})
		});
	}

	return res.status(HttpStatusCode.CREATED).json(newParents);
});

// [PATCH] /
export const updateUserInfo = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateUpdateUserData(req.body);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}

	const updatedUser = await UserService.updateUserInfo(req.profile?._id as string, req.body);
	if (!updatedUser) {
		throw createHttpError.BadRequest('User does not exist!');
	}

	return res.status(HttpStatusCode.CREATED).json(updatedUser);
});

// [GET] /users/teachers?is_verified=true&employment_status=false
export const getTeachersByStatus = useCatchAsync(async (req: Request, res: Response) => {
	const { status } = req.query;
	const teachers = await UserService.getTeacherUsersByStatus(status as string | undefined);
	if (!teachers) {
		throw createHttpError.NotFound('Không thể tìm thấy giáo viên nào!');
	}
	return res.status(HttpStatusCode.OK).json(teachers);
});

// [PATCH] /
export const deactivateTeacherAccount = async (req: Request, res: Response) => {
	const deactivatedTeacher = await UserService.deactivateTeacherUser(req.params.userId);
	if (!deactivatedTeacher) {
		throw createHttpError.NotFound('Cannot find teacher to deactivate!');
	}

	return res.status(HttpStatusCode.CREATED).json(deactivatedTeacher);
};

export const getParentsUserByClass = useCatchAsync(async (req: Request, res: Response) => {
	const parents = await UserService.getParentsUserByClass(req.params.classId);

	return res.status(HttpStatusCode.OK).json(parents);
});

export const searchParentsUsers = useCatchAsync(async (req: Request, res: Response) => {
	const result = await UserService.searchParents(req.body.searchTerm);
	if (!result) throw createHttpError.NotFound('Cannot find any parents account!');

	return res.status(HttpStatusCode.OK).json(result);
});

export const getUserDetails = useCatchAsync(async (req: Request, res: Response) => {
	const user = await UserService.getUserDetails(req.params.id);
	if (!user) throw createHttpError.NotFound('User not found!');

	return res.status(HttpStatusCode.OK).json(user);
});
