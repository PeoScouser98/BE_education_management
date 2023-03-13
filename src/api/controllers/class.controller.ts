import { validateClassData } from './../validations/class.validation';
import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';
import createHttpError, { HttpError } from 'http-errors';
// class feature
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
