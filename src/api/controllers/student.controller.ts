import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { MongooseError, SortOrder } from 'mongoose';
import { Student } from '../models/student.model';
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

// [PUT] /api/student/:id
export const updateStudent = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;
		const payload = req.body;
		const newStudent = await StudentServices.updateStudent(id, payload);

		return res.status(201).json(newStudent);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [GET] /api/students/:class?page=1&_sort=fullName&_order=asc&select='-absentDays'&limit=10
export const getStudentByClass = async (req: Request, res: Response) => {
	try {
		const idClass = req.params.class;
		const order: SortOrder = req.query._order === 'desc' ? 1 : -1;
		const groupBy: string = req.query._sort?.toString() || 'fullName';
		const select: string = req.query.select?.toString() || '-absentDays';
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;

		const result = await StudentServices.getStudentByClass(
			idClass,
			Number(page),
			Number(limit),
			order,
			groupBy,
			select
		);

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [GET] /api/student/:id
export const getStudentDetail = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;

		const result = await StudentServices.getDetailStudent(id);

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [PUT] /api/student/services/:id
export const serviceStudent = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;
		const { type, date } = req.body;
		const optionList = {
			transferSchool: 'transferSchool',
			dropout: 'dropout',
		};
		let result: Student | null = null;

		switch (type) {
			case optionList.transferSchool:
				result = await StudentServices.setStudentTransferSchool(id, date);
				break;
			case optionList.dropout:
				result = await StudentServices.setDropoutStudent(id, date);
				break;
			default:
				throw createHttpError(400, 'Type is not valid');
		}

		return res.status(201).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [GET] /api/students/stop/:type
export const getStudentStop = async (req: Request, res: Response) => {
	try {
		const type = req.params.type;
		const page = req.query.page || 1;
		const limit = req.query.limit || 10;
		const year = req.query.year || new Date().getFullYear();
		const optionList = {
			transferSchool: 'transferSchool',
			dropout: 'dropout',
		};
		let result: any = [];

		switch (type) {
			case optionList.transferSchool:
				result = await StudentServices.getStudentTransferSchool(
					Number(year),
					Number(page),
					Number(limit)
				);
				break;
			case optionList.dropout:
				result = await StudentServices.getStudentDropout(
					Number(year),
					Number(page),
					Number(limit)
				);
				break;
			default:
				throw createHttpError(400, 'Type is not valid');
		}

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};
