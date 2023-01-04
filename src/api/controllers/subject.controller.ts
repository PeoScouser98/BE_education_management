import { Request, Response } from "express";
import createHttpError from "http-errors";
import * as SubjectServices from "../services/subject.service";
import { HttpException } from "../../types/error.type";

export const list = async (req: Request, res: Response) => {
	try {
		const subjects = await SubjectServices.getAllSubjects();
		if (!subjects) throw createHttpError.NotFound("Cannot get subjects!");
		return res.status(200).json(subjects);
	} catch (error) {
		const { message, status } = error as unknown as HttpException;
		return res.json({
			status,
			message,
		});
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const newSubject = await SubjectServices.createNewSubject(req.body);
		if (!newSubject) throw createHttpError.BadRequest("Cannot create new subject!");
		return res.status(201).json(newSubject);
	} catch (error) {
		const { message, status } = error as unknown as HttpException;
		return res.json({
			status,
			message,
		});
	}
};
