import { Request, Response } from 'express';
import { HttpError } from 'http-errors';
import { MongooseError } from 'mongoose';
import * as TransactionService from '../services/subjectTrancription.service';

// [POST] /api/transcripts/:classId/:subjectId
export const scoreTableInputs = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const subjectId = req.params.subjectId;
		const classId = req.params.classId;

		const result = await TransactionService.newScoreList(subjectId, classId, data);

		return res.status(201).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [POST] /api/transcript/:studentId/:subjectId
export const scoreTableInputOne = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const subjectId = req.params.subjectId;
		const studentId = req.params.studentId;

		const result = await TransactionService.newScore(subjectId, studentId, data);

		return res.status(201).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [GET] /api/transcript/class/:classId/:subjectId
export const getTranscriptByClass = async (req: Request, res: Response) => {
	try {
		const subjectId = req.params.subjectId;
		const classId = req.params.classId;

		const result = await TransactionService.selectSubjectTranscriptByClass(classId, subjectId);

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};

// [GET] /api/transcript/student/:id
export const getTranscriptByStudent = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		const result = await TransactionService.selectTranscriptStudent(id);

		return res.status(200).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
			error: (error as any).error,
		});
	}
};
