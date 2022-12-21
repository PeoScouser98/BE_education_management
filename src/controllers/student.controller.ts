// import Student from "../models/student.model";
import { Request, Response } from "express";
import HttpError from "http-errors";
import { HttpException } from "../interfaces/error.interface";
import * as StudentService from "../services/student.service";

export const list = async (req: Request, res: Response) => {
	try {
		const students = await StudentService.getAll();
		if (!students) throw HttpError.NotFound("Cannot find any student!");
		return res.status(200).json(students);
	} catch (error: any) {
		return res.status(error.status).json({
			message: error.message,
		});
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const newStudent = await StudentService.createStudent(req.body);

		console.log("new student:>>", newStudent);
		return res.status(201).json(newStudent);
	} catch (error: any) {
		return res.status(error.status).json({
			message: error.message,
		});
	}
};
