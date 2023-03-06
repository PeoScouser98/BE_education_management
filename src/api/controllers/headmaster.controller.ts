import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';
import transporter from '../../app/nodemailer';
import { Teacher } from '../models/teacher.model';
import * as TeacherService from '../services/teacher.service';
import crypto from 'crypto';
/**
 * @description sign in as head master role using email & password
 * @returns teacherInfo (password not included) @type {Omit<Teacher, P>}
 */
export const signinAsHeadmaster = async (req: Request, res: Response) => {
	try {
		if (!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
			throw createHttpError.BadRequest('Please provide both email and password to signin!');
		}
		// get teacher info
		const teacherInfo = await TeacherService.authenticateTeacher(req.body as Pick<Teacher, 'email' | 'password'>);
		// sign new access token
		const accessToken = jwt.sign({ auth: teacherInfo }, process.env.SECRET_KEY as string, { expiresIn: '30m' });
		const { password: _, ...response } = teacherInfo;
		// attach access token to cookie
		res.cookie('access_token', {
			maxAge: 60 * 60 * 1000,
			httpOnly: true, // only http can read this cookie
		});
		return res.status(200).json({ accessToken: accessToken, user: response });
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError) || 500,
		});
	}
};

/**
 * @description Create new teacher and account to signin for this teacher, only user play a role as headmaster allowed to create teacher account
 * @returns send mail response and new teacher info
 */
export const createTeacherAccount = async (req: Request, res: Response) => {
	try {
		if (!req.body) {
			throw createHttpError.BadRequest('New teacher info must be provided!');
		}
		// generate random password
		const defaultPassword = crypto.randomBytes(32).toString('hex').slice(0, 6);
		// craete new teacher
		const _newTeacher = TeacherService.createTeacherAccount({ password: defaultPassword, ...req.body });
		// Send password to new teacher's email
		const _sendmailResponse = transporter.sendMail({
			from: process.env.ADMIN_EMAIL,
			to: req.body.email,
			subject: `Mật khẩu đăng nhập vào hệ thống quản lý lớp học dành cho giáo viên trường Tiểu học Bột Xuyên`,
			html: /* html */ `
			<div>
				<p>
					Dear Mr/Mrs ${req.body.fullName}!
					<p>
						Giáo viên nhận được mail này vui lòng sử dụng email này mật khẩu dưới đây để đăng nhập vào hệ thống của nhà trường.
					</p>
					<i>Mật khẩu đăng nhập</i> : <b>${defaultPassword}</b> 
				</p>
				<hr>
				<p>
					<span style="display: block">Trân trọng!</span>
					<i>Tiểu học Bột Xuyên</i>
				</p>
			</div>
					`,
		});
		const [newTeacher, sendmailResponse] = await Promise.all([_newTeacher, _sendmailResponse]);
		return res.status(201).json({
			newTeacher,
			sendmailResponse,
		});
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
