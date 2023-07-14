import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import * as TimeTableService from '../services/timeTable.service'
import { validateTimeTableData } from '../validations/timeTable.validation'
import { HttpStatusCode } from './../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'
import { isValidObjectId } from 'mongoose'

// [PUT]: /time-table/:classId
export const saveTimeTable = useCatchAsync(async (req: Request, res: Response) => {
	const { error } = validateTimeTableData(req.body)
	if (error) throw createHttpError.BadRequest(error.message)
	const newTimeTable = await TimeTableService.saveTimeTableByClass(req.body, req.params.classId)
	return res.status(HttpStatusCode.CREATED).json(newTimeTable)
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
	const classId = req.query._classId as string
	if (!classId || !isValidObjectId(classId)) throw createHttpError.BadRequest('Invalid class ID')
	const teacherTimetable = await TimeTableService.getTeacherTimeTableByClass(req.params.teacherId)
	return res.status(HttpStatusCode.OK).json(teacherTimetable)
})
