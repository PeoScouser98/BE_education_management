import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import moment from 'moment'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as AttendanceService from '../services/attendance.service'
import { HttpStatusCode } from './../../configs/statusCode.config'
import { AttendanceSessionEnum } from './../../types/attendance.type'

export const saveAttendanceByClass = useCatchAsync(async (req: Request, res: Response) => {
	const students = req.body
	const result = await AttendanceService.saveAttendanceByClass(students)
	return res.status(HttpStatusCode.CREATED).json(result)
})

export const getStudentAttendance = useCatchAsync(async (req: Request, res: Response) => {
	const studentId: string = req.params.studentId
	const { _f: from, _t: to } = req.query as { [key: string]: string }
	let timeRangeSearchTerm

	if (from && to) {
		if (!moment(from).isValid() || !moment(to).isValid()) {
			throw createHttpError.BadRequest('Invalid time range search term')
		}
		if (!moment(to).isAfter(moment(from))) {
			throw createHttpError.BadRequest('End of time range must be greater than start of the one !')
		}
		timeRangeSearchTerm = {
			from: moment(from).format('YYYY-MM-DD'),
			to: moment(to).format('YYYY-MM-DD')
		}
	}
	const studentAttendance = await AttendanceService.getStudentAttendance(studentId, timeRangeSearchTerm)
	return res.status(HttpStatusCode.OK).json(studentAttendance)
})

export const getClassAttendanceBySession = useCatchAsync(async (req: Request, res: Response) => {
	const session = req.query._ss
	const date = req.query._dt ? req.query._dt.toString() : undefined
	if (!session) throw createHttpError.BadRequest('Session is required for searching!')
	if (!Object.keys(AttendanceSessionEnum).includes(session.toString().toUpperCase()))
		throw createHttpError.BadRequest('Invalid session filter value! Valid values are "morning", "afternoon"')
	const result = await AttendanceService.getClassAttendanceBySession(
		req.params.classId,
		date,
		session.toString().toUpperCase()
	)
	return res.status(HttpStatusCode.OK).json(result)
})
