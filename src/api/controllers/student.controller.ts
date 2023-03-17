import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import * as StudentServices from '../services/student.service';

// creat fetures_students
export const list = async (req: Request, res: Response) => {
	try {
		const students = await StudentServices.getStudentsByClass(req.params.classId).catch(
			(err) => {
				throw createHttpError.NotFound('Cannot find any student!');
			}
		);
		return res.status(200).json(students);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};

export const read = async (req: Request, res: Response) => {
	try {
		return await StudentServices.getStudent(req.params.id).catch((err) => {
			throw createHttpError.NotFound('Cannot find student!');
		});
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const newStudent = await StudentServices.createStudent(req.body);
		console.log('new student:>>', newStudent);
		return res.status(201).json(newStudent);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};

export const update = async (req: Request, res: Response) => {
	try {
		if (!req.body) throw createHttpError.BadRequest('Provide student data to update');
		const updatedStudent = await StudentServices.updateStudent(req.body);
		return res.status(201).json(updatedStudent);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};
