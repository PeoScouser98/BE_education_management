import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import { isValidObjectId } from 'mongoose'
import { HttpStatusCode } from '../../configs/statusCode.config'
import useCatchAsync from '../../helpers/useCatchAsync'
import { IStudent } from '../../types/student.type'
import * as StudentServices from '../services/student.service'

// [POST] /api/students
export const createStudent = useCatchAsync(async (req: Request, res: Response) => {
	const newStudent = await StudentServices.createStudent(req.body)
	return res.status(HttpStatusCode.CREATED).json(newStudent)
})

// [PUT] /api/student/:id
export const updateStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id
	const payload = req.body
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid student ID !')
	const newStudent = await StudentServices.updateStudent(id, payload)
	return res.status(HttpStatusCode.CREATED).json(newStudent)
})

// [GET] /api/students/:classId
export const getStudentsByClass = useCatchAsync(async (req: Request, res: Response) => {
	const classId = req.params.classId
	const result = await StudentServices.getStudentsByClass(classId)
	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /api/student/:id
export const getStudentDetail = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id
	const result = await StudentServices.getDetailStudent(id)
	return res.status(HttpStatusCode.OK).json(result)
})

// [PUT] /api/student/services/:id
export const serviceStudent = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id
	const { type, date } = req.body
	const optionList = {
		transferSchool: 'transferSchool',
		dropout: 'dropout'
	}
	let result: IStudent | null = null

	switch (type) {
		case optionList.transferSchool:
			result = await StudentServices.setStudentTransferSchool(id, date)
			break
		case optionList.dropout:
			result = await StudentServices.setDropoutStudent(id, date)
			break
		default:
			throw createHttpError(400, 'Type is not valid')
	}

	return res.status(HttpStatusCode.CREATED).json(result)
})

// [GET] /api/students/stop/:type
export const getStudentLeftSchool = useCatchAsync(async (req: Request, res: Response) => {
	const type = req.query._type
	const page = req.query._page || 1
	const limit = req.query._limit || 10
	const year = req.query._year || new Date().getFullYear()
	const optionList = {
		transferSchool: 'transfer',
		dropout: 'dropout'
	}
	let result: any = []

	switch (type) {
		case optionList.transferSchool:
			result = await StudentServices.getStudentTransferSchool(Number(year), Number(page), Number(limit))
			break
		case optionList.dropout:
			result = await StudentServices.getStudentDropout(Number(year), Number(page), Number(limit))
			break
		default:
			throw createHttpError(400, 'Type is not valid')
	}
	return res.status(HttpStatusCode.OK).json(result)
})

// [GET] /api/students/policyBeneficiary?page=1&limit=10
export const getPolicyBeneficiary = useCatchAsync(async (req: Request, res: Response) => {
	const page = req.query._page || 1
	const limit = req.query._limit || 10
	const result = await StudentServices.getPolicyBeneficiary(Number(page), Number(limit))
	return res.status(HttpStatusCode.OK).json(result)
})

export const getStudentsByParents = useCatchAsync(async (req: Request, res: Response) => {
	const parentsId = req.profile?._id as string
	const children = await StudentServices.getStudentsByParents(parentsId)
	return res.status(HttpStatusCode.OK).json(children)
})

export const promoteStudentsByClass = useCatchAsync(async (req: Request, res: Response) => {
	const classId = req.params.classId
	const result = await StudentServices.promoteStudentsByClass(classId)
	return res.status(HttpStatusCode.OK).json(result)
})
