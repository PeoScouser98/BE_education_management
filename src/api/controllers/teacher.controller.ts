import crypto from 'crypto';
import 'dotenv/config';
import { Request, Response } from 'express';
import transporter from '../../app/nodemailer';
import jwt from 'jsonwebtoken';
import createHttpError, { HttpError } from 'http-errors';
import * as TeacherService from '../services/teacher.service';
import { publicKey, privateKey } from '../../helpers/readKeys';

/**
 * @description Sign in with role as Teacher
 * @param req
 * @param res
 * @returns access token, teacher info
 */
export const signinAsTeacher = async (req: Request, res: Response) => {
	try {
		const teacherInfo = await TeacherService.authenticateTeacher(req.body);
		const { password: _, ...payload } = teacherInfo;
		const accessToken = jwt.sign({ auth: payload }, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
		// const refreshToken = jwt.sign({auth: payload})
		res.cookie('access_token', accessToken, {
			maxAge: 60 * 60 * 1000,
			httpOnly: true,
		});
		return res.status(200).json(payload);
	} catch (error) {
		// handle errors
	}
};
