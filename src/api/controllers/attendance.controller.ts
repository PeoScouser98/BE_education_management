import { toUpperCase } from './../../helpers/toolkit';
import { AttendanceSessionEnum } from './../../types/attendance.type';
import { HttpStatusCode } from './../../configs/statusCode.config';
import { Request, Response } from 'express';
import useCatchAsync from '../../helpers/useCatchAsync';
import * as AttendanceService from '../services/attendance.service';
import moment from 'moment';
import createHttpError from 'http-errors';

export const saveAttendanceByClass = useCatchAsync(async (req: Request, res: Response) => {
	const students = req.body;
	const result = await AttendanceService.saveAttendanceByClass(students);
	return res.status(HttpStatusCode.CREATED).json(result);
});

export const getAttendanceByClass = useCatchAsync(async (req: Request, res: Response) => {
	const classId: string = req.params.classId;
	// get attendance by class service
	const attendanceDate = req.query._dt as string;
	const result = await AttendanceService.getAttendanceByClass(classId, attendanceDate);
	return res.status(HttpStatusCode.OK).json(result);
});

export const getStudentAttendance = useCatchAsync(async (req: Request, res: Response) => {
	const studentId: string = req.params.studentId;
	const { _f: from, _t: to } = req.query as { [key: string]: string };
	let timeRangeSearchTerm;

	if (from && to) {
		if (!moment(from).isValid() || !moment(to).isValid()) {
			throw createHttpError.BadRequest('Invalid time range search term');
		}
		if (!moment(to).isAfter(moment(from))) {
			throw createHttpError.BadRequest('End of time range must be greater than start of the one !');
		}
		timeRangeSearchTerm = {
			from: moment(from).format('YYYY-DD-MM'),
			to: moment(to).format('YYYY-MM-DD')
		};
	}
	const studentAttendance = await AttendanceService.studentAttendance(studentId, timeRangeSearchTerm);
	return res.status(HttpStatusCode.OK).json(studentAttendance);
});

export const getTodayClassAttendanceBySession = useCatchAsync(async (req: Request, res: Response) => {
	const session = req.query._s;
	if (!session) throw createHttpError.BadRequest('Session is required for searching!');
	const validSessionFilterValues = ['morning', 'afternoon'];
	if (!validSessionFilterValues.includes(session))
		throw createHttpError.BadRequest('Invalid session filter value! Valid values are "morning", "afternoon"');
	const result = await AttendanceService.getTodayClassAttendanceBySession(
		req.params.classId,
		session.toString().toUpperCase()
	);
	return res.status(HttpStatusCode.OK).json(result);
});
