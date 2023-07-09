import { Request, Response } from 'express'
import useCatchAsync from '../../helpers/useCatchAsync'
import * as StudentConductService from '../services/studentRemark.service'
import { HttpStatusCode } from '../../configs/statusCode.config'

export const createStudentRemark = useCatchAsync(async (req: Request, res: Response) => {
	const newStudenConductRemark = await StudentConductService.createStudentRemarkEntireClass(
		req.body,
		req.profile?._id!,
		req.params.classId
	)
	return res.status(HttpStatusCode.CREATED).json(newStudenConductRemark)
})
