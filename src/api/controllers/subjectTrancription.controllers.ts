import { Request, Response } from 'express';
import { HttpException } from '../../types/httpException.type';
import * as TransactionService from '../services/subjectTrancription.service';
import { HttpStatusCode } from '../../configs/statusCode.config';

// [POST] /api/transcripts/:classId/:subjectId
export const scoreTableInputs = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const subjectId = req.params.subjectId;
		const classId = req.params.classId;

		const result = await TransactionService.newScoreList(subjectId, classId, data);

		return res.status(HttpStatusCode.CREATED).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [POST] /api/transcript/:studentId/:subjectId
export const scoreTableInputOne = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const subjectId = req.params.subjectId;
		const studentId = req.params.studentId;

		const result = await TransactionService.newScore(subjectId, studentId, data);

		return res.status(HttpStatusCode.CREATED).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /api/transcript/class/:classId/:subjectId
export const getTranscriptByClass = async (req: Request, res: Response) => {
	try {
		const subjectId = req.params.subjectId;
		const classId = req.params.classId;

		const result = await TransactionService.selectSubjectTranscriptByClass(classId, subjectId);

		return res.status(HttpStatusCode.OK).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /api/transcript/student/:id
export const getTranscriptByStudent = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		const result = await TransactionService.selectTranscriptStudent(id);

		return res.status(HttpStatusCode.OK).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};
