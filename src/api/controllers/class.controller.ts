import { validateClassData } from './../validations/class.validation';
import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';
import createHttpError, { HttpError, isHttpError } from 'http-errors';
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
		if ((error as any)?.code === 11000) {
			return res.status(500).json({
				statusCode: 11000,
				message: `Class name ${(error as any).keyValue?.className} already exists`,
			});
		} else if (isHttpError(error)) {
			return res.status(error.status).json({
				message: error.message,
				statusCode: error.status,
			});
		}
	}
};
