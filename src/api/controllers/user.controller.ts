import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';
import { MongooseError } from 'mongoose';
import { SMTPError } from 'nodemailer/lib/smtp-connection';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../configs/nodemailer';
import { UserRoleEnum } from '../../types/user.type';
import * as UserService from '../services/user.service';
import { paramsStringify } from './../../helpers/queryParams';
import {
	validateNewParentsData,
	validateNewTeacherData,
	validateUpdateUserData,
} from './../validations/user.validation';

export const createTeacherAccount = async (req: Request, res: Response) => {
	try {
		const { error } = validateNewTeacherData({ ...req.body, role: 'TEACHER' });
		if (error) {
			throw createHttpError.BadRequest('Invalid teacher data!');
		}
		const newUser = await UserService.createUser({ ...req.body, role: 'TEACHER' });
		const token = jwt.sign({ auth: newUser.email }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '7d',
		});
		transporter.sendMail(
			{
				from: process.env.ADMIN_EMAIL!,
				to: req.body.email,
				subject: `Kích hoạt tài khoản đăng nhập hệ thống quản lý giáo dục trường TH Bột Xuyên`,
				html: /* html */ `
			<div>
				<p>
					Gửi ${req.body.gender === 'nam' ? 'thầy' : 'cô'} ${req.body.username}!
					<p>
						Giáo viên nhận được mail vui lòng click vào <a href='${
							req.protocol +
							'://' +
							req.get('host') +
							req.originalUrl +
							paramsStringify({ user_type: 'teacher', token: token })
						}'>link</a> này để xác thực tài khoản.
					</p>
					<i>Giáo viên lưu ý: Mail xác thực này có hiệu lực trong vòng 7 ngày</i>
				</p>
				<hr>
				<p>
					<span style="display: block">Trân trọng!</span>
					<i>Tiểu học Bột Xuyên</i>
				</p>
			</div>
					`,
			},
			(err: Error | null, info: SMTPTransport.SentMessageInfo): void => {
				if (err) throw new Error(err.message);
				else console.log(info.response);
			}
		);

		return res.status(201).json(newUser);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | SMTPError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const createParentsAccount = async (req: Request, res: Response) => {
	try {
		// validate new parent data
		const { error } = validateNewParentsData(req.body);
		if (error) {
			console.log(error.message);
			throw createHttpError.BadRequest(error.message);
		}

		// create new user as parent role
		const newParentUser = await UserService.createUser({
			...req.body,
			role: UserRoleEnum.PARENTS,
			password: '123@123',
			picture: `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${req.body.displayName.at(
				0
			)}`,
		});

		// done
		return res.status(201).json(newParentUser);
	} catch (error) {
		console.log(error);
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error | MongooseError).message,
			statusCode: (error as HttpError).status,
		});
	}
};

export const updateUserInfo = async (req: Request, res: Response) => {
	try {
		console.log(req.profile);
		const { error } = validateUpdateUserData(req.body);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		const updatedUser = await UserService.updateUserInfo(req.profile?._id as string, req.body);
		if (!updatedUser) {
			throw createHttpError.BadRequest('User does not exist!');
		}
		return res.status(201).json(updatedUser);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error | MongooseError).message,
			statusCode: (error as HttpError).status,
		});
	}
};
