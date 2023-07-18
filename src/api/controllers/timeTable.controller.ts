import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as TimeTableService from '../services/timeTable.service'
import { HttpStatusCode } from './../../configs/statusCode.config'

// [PUT]: /time-table/:classId
export const saveTimeTable = useCatchAsync(async (req: Request, res: Response) => {
	const result = await TimeTableService.saveTimeTableByClass(req.body, req.params.classId)
	const { error } = result
	if (error) return res.status(error.statusCode).json(result)
	return res.status(HttpStatusCode.CREATED).json(result)
})

// [GET] /time-table/:classId
export const getTimeTableByClass = useCatchAsync(async (req: Request, res: Response) => {
	const withDetails = req.query._details as string
	if (!withDetails) throw createHttpError.BadRequest('Query params "_details" must be provided! ')
	const timeTable =
		withDetails && withDetails === 'true'
			? await TimeTableService.getTimeTableDetail(req.params.classId)
			: await TimeTableService.getTimetableByClass(req.params.classId)
	if (!timeTable) throw createHttpError.NotFound('Time table not found!')
	return res.status(HttpStatusCode.OK).json(timeTable)
})

// [GET] /time-table
export const getTeacherTimetable = useCatchAsync(async (req: Request, res: Response) => {
	const teacherId = req.profile._id as string
	const teacherTimetable = await TimeTableService.getTeacherTimeTable(teacherId)
	return res.status(HttpStatusCode.OK).json(teacherTimetable)
})
