import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import { HttpException } from '../../types/httpException.type';
import * as SubjectServices from '../services/subject.service';
import { HttpStatusCode } from '../../configs/statusCode.config';

// [GET] /api/subjects
export const list = async (req: Request, res: Response) => {
	try {
		const subjects = await SubjectServices.getAllSubjects();
		if (!subjects) throw createHttpError.NotFound('Cannot get subjects!');
		return res.status(HttpStatusCode.OK).json(subjects);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const read = async (req: Request, res: Response) => {
	try {
		const subject = await SubjectServices.getOneSubject(req.params.id);
		return res.status(HttpStatusCode.OK).json(subject);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [POST] /api/subjects
export const create = async (req: Request, res: Response) => {
	try {
		const newSubject = await SubjectServices.createNewSubject(req.body);
		if (!newSubject) throw createHttpError.BadRequest('Cannot create new subject!');
		return res.status(HttpStatusCode.CREATED).json(newSubject);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [PUT] /api/subject/:id
export const update = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const newSubject = await SubjectServices.updateSubject(id, req.body);

		return res.status(HttpStatusCode.CREATED).json(newSubject);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [DELETE] /api/subject/:id?option=force
export const deleted = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const option = req.query.option || 'soft';
		if (!id) {
			throw createHttpError(HttpStatusCode.NO_CONTENT);
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
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [PUT] /api/subject/restore/:id
export const restore = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;

		const result = await SubjectServices.restore(id);

		return res.status(result.statusCode).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /api/subjects/trash
export const getTrash = async (req: Request, res: Response) => {
	try {
		const result = await SubjectServices.getTrash();
		return res.status(HttpStatusCode.OK).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};
