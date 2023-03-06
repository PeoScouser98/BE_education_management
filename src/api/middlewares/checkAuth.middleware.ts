import createHttpError from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import 'dotenv/config';
import { publicKey } from '../../helpers/readKeys';
import HeadmasterModel, { Headmaster } from '../models/headmaster.model';
import TeacherModel, { Teacher } from '../models/teacher.model';

export const checkIsHeadmaster = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.cookies['access_token'];
		if (!accessToken) throw createHttpError.Forbidden('Access token must be provided!');

		const decodedPayload = jwt.verify(accessToken, publicKey, { algorithms: ['RS256'] }) as Partial<Headmaster>;
		await HeadmasterModel.exists({ email: decodedPayload.email }, (error, result) => {
			if (error) {
				return res.status(403).json({
					message: 'Only user who plays a role as Head master allowed to access this request!',
					status: 403,
				});
			} else {
				next();
			}
		});

		// handle logic ...
	} catch (error) {
		return res.status(401).json({
			message: (error as JsonWebTokenError).message,
			status: 401,
		});
	}
};

export const checkIsTeacher = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.cookies['access_token'];
		if (!accessToken) throw createHttpError.Forbidden('Access token must be provided!');

		const decoded = jwt.verify(accessToken, publicKey, { algorithms: ['RS256'] }) as Partial<Teacher>;

		await TeacherModel.exists({ _id: decoded?._id, email: decoded?.email }, (error, result) => {
			if (error) {
				throw createHttpError.Forbidden('Only user who plays a role as teacher allowed to access this request!');
			}
		});
	} catch (error) {
		return res.status(401).json({
			message: (error as JsonWebTokenError).message,
			status: 401,
		});
	}
};
