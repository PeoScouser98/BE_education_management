import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { MongooseError } from 'mongoose';
import * as SchoolYearServices from '../services/schoolYear.service';

// [GET] /api/schoolYears?limit=10&page=1
export const schoolYearList = async (req: Request, res: Response) => {
	try {
		const limit: number = req.query.limit ? Number(req.query.limit) : 10;
		const page: number = req.query.page ? Number(req.query.page) : 1;
		const result = await SchoolYearServices.getAllSchoolYear(limit, page);

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [POST] /api/schoolYear
export const createSchoolYear = async (req: Request, res: Response) => {
	try {
		const result = await SchoolYearServices.createSchoolYear();

		return res.status(201).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};
