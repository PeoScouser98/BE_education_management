import { HttpException } from "../../types/error.type";
import { Request, Response } from "express";
import createHttpError from "http-errors";
import * as StudentServices from "../services/student.service";

export const list = async (req: Request, res: Response) => {
	try {
		const students = await StudentServices.getStudentsByClass(req.params.classId);
		if (!students) throw createHttpError.NotFound("Cannot find any student!");
		return res.status(200).json(students);
	} catch (error) {
		const { message, status } = error as HttpException;
		return res.json({ message, status });
	}
};

export const read = async (req: Request, res: Response) => {
	try {
		return await StudentServices.getStudent(req.params.id);
	} catch (error) {
		const { message, status } = error as HttpException;
		return res.json({
			message,
			status,
		});
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const newStudent = await StudentServices.createStudent(req.body);
		console.log("new student:>>", newStudent);
		return res.status(201).json(newStudent);
	} catch (error) {
		const { message, status } = error as HttpException;

		return res.json({ message, status });
	}
};

export const update = async (req: Request, res: Response) => {
	try {
		const updatedStudent = await StudentServices.updateStudent(req.body);
		if (!updatedStudent) throw createHttpError.BadRequest("Cannot update student information!");
		return res.status(201).json(updatedStudent);
	} catch (error) {
		const { message, status } = error as HttpException;

		return res.json({ message, status });
	}
};
