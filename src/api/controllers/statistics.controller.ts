import { Request, Response } from 'express'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as StatisticsService from '../services/statistics.service'
import { HttpStatusCode } from '../../configs/statusCode.config'
import createHttpError from 'http-errors'

export const getStdPercentageByGrade = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getStdPercentageByGrade()
	return res.status(HttpStatusCode.OK).json(result)
})

export const getGoodStudentByClass = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getGoodStudentByClass(req.params.classId)
	return res.status(HttpStatusCode.OK).json(result)
})

export const getPolicyBeneficiary = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getPolicyBeneficiary()
	return res.status(HttpStatusCode.OK).json(result)
})

export const getStdAllClass = useCatchAsync(async (req: Request, res: Response) => {
	const level = req.query.level
	if (!level) {
		throw createHttpError(400, 'Không xác định được loại học lực cần thống kê')
	}

	const result = await StatisticsService.getStdAllClass(level as 'level1' | 'level2' | 'level3')
	return res.status(HttpStatusCode.OK).json(result)
})
