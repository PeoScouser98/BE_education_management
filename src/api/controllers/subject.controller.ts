import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { MongooseError } from 'mongoose';
import * as SubjectServices from '../services/subject.service';

// [GET] /api/subjects
export const list = async (req: Request, res: Response) => {
	try {
		const subjects = await SubjectServices.getAllSubjects();
		if (!subjects) throw createHttpError.NotFound('Cannot get subjects!');
		return res.status(200).json(subjects);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const read = async (req: Request, res: Response) => {
	try {
		const subject = await SubjectServices.getOneSubject(req.params.id);
		return res.status(200).json(subject);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [POST] /api/subjects
export const create = async (req: Request, res: Response) => {
	try {
		const newSubject = await SubjectServices.createNewSubject(req.body);
		if (!newSubject) throw createHttpError.BadRequest('Cannot create new subject!');
		return res.status(201).json(newSubject);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [PUT] /api/subject/:id
export const update = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const newSubject = await SubjectServices.updateSubject(id, req.body);

		return res.status(201).json(newSubject);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [DELETE] /api/subject/:id?option=force
export const deleted = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const option = req.query.option || 'soft';
		if (!id) {
			throw createHttpError(204);
		}
		let result;

		switch (option) {
			case 'soft':
				result = await SubjectServices.deleteSoft(id);
				break;
			case 'force':
				result = await SubjectServices.deleteForce(id);
				break;

			default:
				throw createHttpError.InternalServerError('InternalServerError');
		}

		return res.status(result.statusCode).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [PUT] /api/subject/restore/:id
export const restore = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;

		const result = await SubjectServices.restore(id);

		return res.status(result.statusCode).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [GET] /api/subjects/trash
export const getTrash = async (req: Request, res: Response) => {
	try {
		const result = await SubjectServices.getTrash();

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
