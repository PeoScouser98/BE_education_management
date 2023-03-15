import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';
import { SMTPError } from 'nodemailer/lib/smtp-connection';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../app/nodemailer';
import { createUser } from '../services/user.service';
import { paramsStringify } from './../../helpers/queryParams';
import { validateTeacherAccount } from './../validations/user.validation';
/**
 * @description Create new teacher and account to signin for this teacher, only user play a role as headmaster allowed to create teacher account
 * @returns {Teacher}
 */
export const createTeacherAccount = async (req: Request, res: Response) => {
	try {
		const { error } = validateTeacherAccount({ ...req.body, role: 'TEACHER' });
		if (error) {
			throw createHttpError.BadRequest('Invalid teacher data!');
		}
		const newUser = await createUser({ ...req.body, role: 'TEACHER' });
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
					Dear ${req.body.gender === 'nam' ? 'Mr' : 'Ms/Mrs'} ${req.body.username}!
					<p>
						Giáo viên nhận được mail này vui lòng click vào <a href='${
							req.protocol +
							'://' +
							req.get('host') +
							req.originalUrl +
							paramsStringify({ user_type: 'teacher', token: token })
						}'>link</a> này để xác thực tài khoản.
					</p>
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
