// import Student from "../models/student.model";
import Student from "../models/student.model";
import { Request, Response } from "express";
import HttpError from "http-errors";
import { HttpException } from "../interfaces/error.interface";
// import "express-async-errors";

export const list = async (req: Request, res: Response) => {
	try {
		const students = await Student.find().exec();
		if (!students) throw HttpError.NotFound("Cannot find any student!");
		return res.status(200).json(students);
	} catch (error: any) {
		return res.status(error.status).json({
			message: error.message,
		});
	}
};
