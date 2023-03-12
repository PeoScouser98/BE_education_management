import crypto from 'crypto';
import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { SMTPError } from 'nodemailer/lib/smtp-connection';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../app/nodemailer';
import { createUser } from '../services/user.service';

/**
 * @description Create new teacher and account to signin for this teacher, only user play a role as headmaster allowed to create teacher account
 * @returns {Teacher}
 */
export const createTeacherAccount = async (req: Request, res: Response) => {
	try {
		if (!req.body) {
			throw createHttpError.BadRequest('New teacher info must be provided!');
		}
		const newUser = await createUser({ ...req.body, role: 'TEACHER' });
		transporter.sendMail(
			{
				from: process.env.ADMIN_EMAIL!,
				to: req.body.email,
				subject: `Mật khẩu đăng nhập vào hệ thống quản lý lớp học dành cho giáo viên trường Tiểu học Bột Xuyên`,
				html: /* html */ `
			<div>
				<p>
					Dear ${req.body.gender === 'male' ? 'Mr' : 'Ms/Mrs'} ${req.body.username}!
					<p>
						Giáo viên nhận được mail này có thể sử dụng mail này để đăng nhập vào hệ thống quản lý theo đường <a href='${
							req.protocol + '://' + req.hostname + req.originalUrl
						}/signin'>link</a> này.
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
