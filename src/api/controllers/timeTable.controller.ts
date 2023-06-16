import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import { HttpException } from '../../types/httpException.type';
import * as TimeTableService from '../services/timeTable.service';
import { validateNewTimeTable, validateUpdateTimeTablePayload } from '../validations/timeTable.validation';
import { HttpStatusCode } from './../../configs/statusCode.config';
import useCatchAsync from '../../helpers/useCatchAsync';

// [POST]: /time-table
export const createTimeTable = async (req: Request, res: Response) => {
	try {
		const { error } = validateNewTimeTable(req.body);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}
		const newTimeTable = await TimeTableService.createTimetable(req.body);
		return res.status(HttpStatusCode.CREATED).json(newTimeTable);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [PATCH] /time-table/:classId
export const updateTimeTable = async (req: Request, res: Response) => {
	try {
		const { error } = validateUpdateTimeTablePayload(req.body);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}
		const updatedTimeTable = await TimeTableService.updateTimetable({
			classId: req.params.classId,
			payload: req.body
		});
		if (!updatedTimeTable) {
			throw createHttpError.NotFound('Cannot find time table to update!');
		}
		return res.status(HttpStatusCode.CREATED).json(updatedTimeTable);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [DELETE] /time-table/:classId
export const deleteTimeTable = async (req: Request, res: Response) => {
	try {
		const deletedTimeTable = await TimeTableService.deleteTimeTable(req.params.classId);
		if (!deletedTimeTable) {
			throw createHttpError.NotFound('Cannot find time table to delete!');
		}

		return res.status(HttpStatusCode.NO_CONTENT).json({
			message: 'Deleted!',
			statusCode: HttpStatusCode.NO_CONTENT
		});
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /time-table/:classId
export const getTimeTableByClass = async (req: Request, res: Response) => {
	try {
		const timeTable = await TimeTableService.getTimetableByClass(req.params.classId);
		if (!timeTable) {
			throw createHttpError.NotFound('Time table not found!');
		}
		return res.status(HttpStatusCode.OK).json(timeTable);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const getTeacherTimetable = useCatchAsync(async (req: Request, res: Response) => {
	console.log('req.params.teacherId :>> ', req.params.teacherId);
	const teacherTimetable = await TimeTableService.getTeacherTimeTable(req.params.teacherId);
	return res.status(HttpStatusCode.OK).json(teacherTimetable);
});
