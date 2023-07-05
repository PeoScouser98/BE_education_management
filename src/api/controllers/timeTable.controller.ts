import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import * as TimeTableService from '../services/timeTable.service';
import { validateNewTimeTable, validateUpdateTimeTablePayload } from '../validations/timeTable.validation';
import { HttpStatusCode } from './../../configs/statusCode.config';
import useCatchAsync from '../../helpers/useCatchAsync';
import { isValidObjectId } from 'mongoose';

// [POST]: /time-table
export const createTimeTable = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateNewTimeTable(req.body);
	if (error) throw createHttpError.BadRequest(error.message);
	const newTimeTable = await TimeTableService.createTimetable(req.body);
	return res.status(HttpStatusCode.CREATED).json(newTimeTable);
});

// [PATCH] /time-table/:classId
export const updateTimeTable = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateUpdateTimeTablePayload(req.body);
	if (error) throw createHttpError.BadRequest(error.message);
	const updatedTimeTable = await TimeTableService.updateTimetable({
		classId: req.params.classId,
		payload: req.body
	});
	if (!updatedTimeTable) {
		throw createHttpError.NotFound('Cannot find time table to update!');
	}
	return res.status(HttpStatusCode.CREATED).json(updatedTimeTable);
});

// [DELETE] /time-table/:classId
export const deleteTimeTable = useCatchAsync(async (req: Request, res: Response) => {
	const deletedTimeTable = await TimeTableService.deleteTimeTable(req.params.classId);
	if (!deletedTimeTable) {
		throw createHttpError.NotFound('Cannot find time table to delete!');
	}

	return res.status(HttpStatusCode.NO_CONTENT).json({
		message: 'Deleted!',
		statusCode: HttpStatusCode.NO_CONTENT
	});
});

// [GET] /time-table/:classId
export const getTimeTableByClass = useCatchAsync(async (req: Request, res: Response) => {
	const withDetails = req.query._details;
	const timeTable = withDetails
		? await TimeTableService.getTimeTableDetail(req.params.classId)
		: await TimeTableService.getTimetableByClass(req.params.classId);
	if (!timeTable) throw createHttpError.NotFound('Time table not found!');
	return res.status(HttpStatusCode.OK).json(timeTable);
});

export const getTeacherTimetable = useCatchAsync(async (req: Request, res: Response) => {
	const classId = req.query._classId as string;
	if (!classId || !isValidObjectId(classId)) throw createHttpError.BadRequest('Invalid class ID');
	const teacherTimetable = await TimeTableService.getTeacherTimeTableByClass(req.params.teacherId, classId);
	return res.status(HttpStatusCode.OK).json(teacherTimetable);
});
