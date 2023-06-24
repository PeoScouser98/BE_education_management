import { Request, Response } from 'express';
import useCatchAsync from '../../helpers/useCatchAsync';
import * as StudentConductService from '../services/studentRemark.service';
import { HttpStatusCode } from '../../configs/statusCode.config';

export const createStudentRemark = useCatchAsync(async (req: Request, res: Response) => {
	// console.log(req.profile);
	const newStudenConductRemark = await StudentConductService.createStudentRemark(req.body, req.profile?._id!);
	return res.status(HttpStatusCode.CREATED).json(newStudenConductRemark);
});
