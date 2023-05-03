import { Request, Response } from 'express';
import * as TimeTableService from '../services/timeTable.service';
import {
	validateNewTimeTable,
	validateUpdateTimeTablePayload,
} from '../validations/timeTable.validation';
import createHttpError, { HttpError } from 'http-errors';
import { MongooseError } from 'mongoose';

// [POST]: /time-table
export const createTimeTable = async (req: Request, res: Response) => {
	try {
		const { error } = validateNewTimeTable(req.body);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}
		const newTimeTable = await TimeTableService.createTimetable(req.body);
		return res.status(201).json(newTimeTable);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
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
			payload: req.body,
		});
		if (!updatedTimeTable) {
			throw createHttpError.NotFound('Cannot find time table to update!');
		}
		return res.status(201).json(updatedTimeTable);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [DELETE] /time-table/:classId
export const deleteTimeTable = async (req: Request, res: Response) => {
	try {
		const deletedTimeTable = await TimeTableService.deleteTimeTable(req.params.classId);
		if (!deletedTimeTable) {
			throw createHttpError.NotFound('Cannot find time table to delete!');
		}

		return res.status(204).json({
			message: 'Deleted!',
			statusCode: 204,
		});
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

// [GET] /time-table/:classId
export const getTimeTableByClass = async (req: Request, res: Response) => {
	try {
		const timeTable = await TimeTableService.getTimetableByClass(req.params.classId);
		if (!timeTable) {
			throw createHttpError.NotFound('Time table not found!');
		}
		return res.status(200).json(timeTable);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | MongooseError).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
