import crypto from 'crypto';
import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';
import { SMTPError } from 'nodemailer/lib/smtp-connection';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import transporter from '../../app/nodemailer';
import { privateKey } from '../../helpers/readKeys';
import { Teacher } from '../models/teacher.model';
import * as HeadmasterService from '../services/headmaster.service';
import * as TeacherService from '../services/teacher.service';
import { Headmaster } from './../models/headmaster.model';

/**
 * @description sign in as head master role using email & password
 * @returns {Partial<Headmaster>}
 */
export const signinAsHeadmaster = async (req: Request, res: Response) => {
	try {
		if (!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
			throw createHttpError.BadRequest('Please provide both email and password to signin!');
		}
		// get teacher info
		const headmasterInfo = (await HeadmasterService.authenticateHeadmaster(req.body as Pick<Headmaster, 'email' | 'password'>)) as Partial<Headmaster>;
		// sign new access token
		const accessToken = jwt.sign({ auth: headmasterInfo }, privateKey, { algorithm: 'RS256', expiresIn: '30m' });
		// attach access token to cookie
		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true, // only http can read this cookie
		});
		headmasterInfo.password = undefined;
		return res.status(200).json({ accessToken: accessToken, user: headmasterInfo });
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

/**
 * @description Create new teacher and account to signin for this teacher, only user play a role as headmaster allowed to create teacher account
 * @returns {Teacher}
 */
export const createTeacherAccount = async (req: Request, res: Response) => {
	try {
		if (!req.body) {
			throw createHttpError.BadRequest('New teacher info must be provided!');
		}
		// generate random password
		const defaultPassword = crypto.randomBytes(32).toString('hex').slice(0, 6);
		// craete new teacher
		const newTeacher = await TeacherService.createTeacherAccount({ password: defaultPassword, ...req.body });
		// Send password to new teacher's email

		transporter.sendMail(
			{
				from: process.env.ADMIN_EMAIL!,
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
			},
			(err: Error | null, info: SMTPTransport.SentMessageInfo): void => {
				if (err) throw new Error(err.message);
				else console.log(info.response);
			}
		);

		return res.status(201).json(newTeacher);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | SMTPError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
