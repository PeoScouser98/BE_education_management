import createHttpError from 'http-errors'
import { IClass, TClassSortOption } from '../../types/class.type'
import ClassModel from '../models/class.model'
import { validateClassData, validateClassEditData } from '../validations/class.validation'

export const getOneClass = async (classId: string) =>
	await ClassModel.findOne({ _id: classId }).populate({
		path: 'totalStudents'
	})

export const getAllClass = async (sortOption: TClassSortOption) =>
	await ClassModel.find().populate({ path: 'totalStudents' }).sort(sortOption)

export const createClass = async (payload: Omit<IClass, '_id'>) => {
	const { error } = validateClassData(payload)
	if (error) throw createHttpError.BadRequest(error.message)
	const existedClass = await ClassModel.exists({
		className: payload.className.toUpperCase()
	})
	if (existedClass) throw createHttpError.Conflict(`Class ${payload.className} already exists`)
	const classResult: IClass = await new ClassModel(payload).save()
	return {
		classes: classResult
	}
}

export const updateClass = async (payload: Partial<Omit<IClass, '_id'>>, classId: string) => {
	const existedClass = await ClassModel.findOne({ _id: classId })
	if (!existedClass) throw createHttpError.NotFound('Classes does not exist')
	// trường hợp className và grade không khớp nhau
	if (payload.className && !payload.grade && !payload.className.startsWith(JSON.stringify(existedClass?.grade)))
		throw createHttpError.BadRequest(`Invalid Class name, class's name: grade+"A|B|C|D...`)
	// check validate data gửi lên
	const { error } = validateClassEditData(payload)
	if (error) {
		throw createHttpError.BadRequest(error.message)
	}
	return await ClassModel.findOneAndUpdate({ _id: classId }, payload, { new: true })
}

export const deleteClass = async (classId: string) => {
	const existedClass = await ClassModel.findOne({ _id: classId }).populate('totalStudents')
	if (!existedClass) throw createHttpError.NotFound('Cannot find class to delete')
	if (existedClass.totalStudents! > 0)
		throw createHttpError.Conflict('Cannot delete class due to there are students in this class !')
	await ClassModel.deleteOne({ _id: classId })
	return {
		message: 'Class has been permanently deleted',
		statusCode: 200
	}
}
