import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import * as SubjectServices from '../services/subject.service';

export const list = async (req: Request, res: Response) => {
	try {
		const subjects = await SubjectServices.getAllSubjects();
		if (!subjects) throw createHttpError.NotFound('Cannot get subjects!');
		return res.status(200).json(subjects);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const newSubject = await SubjectServices.createNewSubject(req.body);
		if (!newSubject) throw createHttpError.BadRequest('Cannot create new subject!');
		return res.status(201).json(newSubject);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
