import { Request, Response } from 'express'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as StatisticsService from '../services/statistics.service'
import { HttpStatusCode } from '../../configs/statusCode.config'

export const getStdPercentageByGrade = useCatchAsync(async (req: Request, res: Response) => {
	const result = await StatisticsService.getStdPercentageByGrade()
	return res.status(HttpStatusCode.OK).json(result)
})
