import { Request, Response } from 'express';
import { HttpException } from '../../types/httpException.type';
import * as TransactionService from '../services/subjectTrancription.service';
import { HttpStatusCode } from '../../configs/statusCode.config';
import useCatchAsync from '../../helpers/useCatchAsync';

// [POST] /api/transcripts/:classId/:subjectId
export const scoreTableInputs = useCatchAsync(async (req: Request, res: Response) => {
	const data = req.body;
	const subjectId = req.params.subjectId;
	const classId = req.params.classId;
	const result = await TransactionService.newScoreList(subjectId, classId, data);

	return res.status(HttpStatusCode.CREATED).json(result);
});

// [POST] /api/transcript/:studentId/:subjectId
export const scoreTableInputOne = useCatchAsync(async (req: Request, res: Response) => {
	const data = req.body;
	const subjectId = req.params.subjectId;
	const studentId = req.params.studentId;
	const result = await TransactionService.newScore(subjectId, studentId, data);

	return res.status(HttpStatusCode.CREATED).json(result);
});

// [GET] /api/transcript/class/:classId/:subjectId
export const getTranscriptByClass = useCatchAsync(async (req: Request, res: Response) => {
	const subjectId = req.params.subjectId;
	const classId = req.params.classId;
	const result = await TransactionService.selectSubjectTranscriptByClass(classId, subjectId);

	return res.status(HttpStatusCode.OK).json(result);
});

// [GET] /api/transcript/student/:id
export const getTranscriptByStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const result = await TransactionService.selectTranscriptStudent(id);

	return res.status(HttpStatusCode.OK).json(result);
});
