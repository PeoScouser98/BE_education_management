import { validateClassData } from './../validations/class.validation';
import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';
import createHttpError, { HttpError } from 'http-errors';
import { Class } from '../models/class.model';
// class feature

// [POST] /api/classes (create classes)
export const createClass = async (req: Request, res: Response) => {
	try {
		const { error } = validateClassData(req.body);
		if (error) {
			throw createHttpError.BadGateway(error.message);
		}
		const newClass = await ClassService.createClass(req.body);
		return res.status(201).json(newClass);
	} catch (error) {
		return res.status((error as HttpError).status).json({
			message: (error as HttpError).message,
			statusCode: (error as HttpError).status,
		});
	}
};

// [PUT] /api/classe/:_id (edit classes)
export const updateClass = async (req: Request, res: Response) => {
	try {
		const _id: unknown = req.params._id;
		const data: Partial<Omit<Class, '_id'>> = req.body;

		const { newClasses, errorResult } = await ClassService.updateClasses(data, _id as string);

		if (errorResult) {
			return res.status(errorResult.statusCode).json(errorResult);
		}

		return res.status(200).json({
			classe: newClasses,
			message: 'Class update successful',
		});
	} catch (error) {
		return res.status((error as HttpError).status).json({
			message: (error as HttpError).message,
			statusCode: (error as HttpError).status,
		});
	}
};
