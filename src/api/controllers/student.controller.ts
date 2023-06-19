import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import { SortOrder } from 'mongoose';
import { formatDate } from '../../helpers/toolkit';
import { IStudent } from '../../types/student.type';
import * as StudentServices from '../services/student.service';
import { HttpStatusCode } from '../../configs/statusCode.config';
import useCatchAsync from '../../helpers/useCatchAsync';

// [POST] /api/students
export const createStudent = useCatchAsync(async (req: Request, res: Response) => {
	const newStudent = await StudentServices.createStudent(req.body);

	return res.status(HttpStatusCode.CREATED).json(newStudent);
});

// [PUT] /api/student/:id
export const updateStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id;
	const payload = req.body;
	const newStudent = await StudentServices.updateStudent(id, payload);

	return res.status(HttpStatusCode.CREATED).json(newStudent);
});

// [GET] /api/students/:class?page=1&_sort=fullName&_order=asc&select='-absentDays'&limit=10
export const getStudentByClass = useCatchAsync(async (req: Request, res: Response) => {
	const idClass = req.params.class;
	const order: SortOrder = req.query._order === 'desc' ? 1 : -1;
	const groupBy: string = req.query._sort?.toString() || 'fullName';
	const select: string = req.query.select?.toString() || '';
	const result = await StudentServices.getStudentByClass(idClass, order, groupBy, select);

	return res.status(HttpStatusCode.OK).json(result);
});

// [GET] /api/student/:id
export const getStudentDetail = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id;
	const result = await StudentServices.getDetailStudent(id);

	return res.status(HttpStatusCode.OK).json(result);
});

// [PUT] /api/student/services/:id
export const serviceStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id;
	const { type, date } = req.body;
	const optionList = {
		transferSchool: 'transferSchool',
		dropout: 'dropout'
	};
	let result: IStudent | null = null;

	switch (type) {
		case optionList.transferSchool:
			result = await StudentServices.setStudentTransferSchool(id, date);
			break;
		case optionList.dropout:
			result = await StudentServices.setDropoutStudent(id, date);
			break;
		default:
			throw createHttpError(400, 'Type is not valid');
	}

	return res.status(HttpStatusCode.CREATED).json(result);
});

// [GET] /api/students/stop/:type
export const getStudentStop = useCatchAsync(async (req: Request, res: Response) => {
	const type = req.params.type;
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const year = req.query.year || new Date().getFullYear();
	const optionList = {
		transferSchool: 'transferSchool',
		dropout: 'dropout'
	};
	let result: any = [];

	switch (type) {
		case optionList.transferSchool:
			result = await StudentServices.getStudentTransferSchool(Number(year), Number(page), Number(limit));
			break;
		case optionList.dropout:
			result = await StudentServices.getStudentDropout(Number(year), Number(page), Number(limit));
			break;
		default:
			throw createHttpError(400, 'Type is not valid');
	}

	return res.status(HttpStatusCode.OK).json(result);
});

// [PUT] /api/student/attendance/:classId
export const attendanceStudentByClass = useCatchAsync(async (req: Request, res: Response) => {
	const classId: string = req.params.classId;
	const data = req.body;
	const result = await StudentServices.markAttendanceStudent(classId, data);

	return res.status(HttpStatusCode.CREATED).json(result);
});

// [GET] /api/students/attendance/:classId?date='03-26-2023' MM-DD-YYYY
export const selectAttendanceByClass = useCatchAsync(async (req: Request, res: Response) => {
	const classId: string = req.params.classId;
	let date: any = req.query?.date;

	if (date) {
		date = new Date(formatDate(new Date(date)));
	} else {
		date = new Date(formatDate(new Date()));
	}

	const result = await StudentServices.dailyAttendanceList(classId, date);
	return res.status(HttpStatusCode.OK).json(result);
});

// [GET] /api/student/attendance/:id?month=03&year2023
export const selectAttendanceByStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id;
	const month = req.query.month || new Date().getMonth() + 1;
	const year = req.query.year || new Date().getFullYear();
	const result = await StudentServices.attendanceOfStudentByMonth(id, Number(month), Number(year));

	return res.status(HttpStatusCode.OK).json(result);
})

// [GET] /api/students/policyBeneficiary?page=1&limit=10
export const getPolicyBeneficiary = useCatchAsync(async (req: Request, res: Response) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const result = await StudentServices.getPolicyBeneficiary(Number(page), Number(limit));

	return res.status(HttpStatusCode.OK).json(result);
})

// [GET] /students/attendance?page=1&limit=10&date='03-28-2023' MM-DD-YYYY
export const selectAttendanceAllClass = useCatchAsync(async (req: Request, res: Response) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	let date: any = req.query?.date;

	if (date) {
		date = new Date(formatDate(new Date(date)));
	} else {
		date = new Date(formatDate(new Date()));
	}

	const result = await StudentServices.getAttendanceAllClass(Number(page), Number(limit), date);

	return res.status(HttpStatusCode.OK).json(result);
});
