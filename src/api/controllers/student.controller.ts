import { Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { MongooseError } from 'mongoose';
import * as StudentServices from '../services/student.service';

// [POST] /api/students
export const createStudent = async (req: Request, res: Response) => {
	try {
		const newStudent = await StudentServices.createStudent(req.body);

		return res.status(201).json(newStudent);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};
