/* eslint-disable @typescript-eslint/no-explicit-any */
import createHttpError from 'http-errors'
import moment from 'moment'
import mongoose, { isValidObjectId } from 'mongoose'
import { IAttendance } from '../../types/attendance.type'
import AttendanceModel from '../models/attendance.model'
import StudentModel from '../models/student.model'
import { validateAttedancePayload } from '../validations/attendance.validation'
import { AttendanceSessionEnum } from './../../types/attendance.type'
import ClassModel from '../models/class.model'
import { IStudent } from '../../types/student.type'

export const saveAttendanceByClass = async (payload: Array<Omit<IAttendance, '_id'>>, session: string) => {
	const { error } = validateAttedancePayload(payload)
	if (error) throw createHttpError.BadRequest(error.message)

	const bulkWriteOption: any = payload.map((atd: Omit<IAttendance, '_id'>) => ({
		updateOne: {
			filter: {
				student: atd.student,
				session: AttendanceSessionEnum[session as keyof typeof AttendanceSessionEnum],
				date: moment().format('YYYY-MM-DD')
			},
			update: atd,
			upsert: true
		}
	}))
	await AttendanceModel.bulkWrite(bulkWriteOption)

	return { message: 'Save attendance successfully !' }
}

export const getStudentAttendance = async (studentId: string, timeRangeOption?: { from: string; to: string }) => {
	if (!isValidObjectId(studentId)) throw createHttpError.BadRequest('Invalid student ID')
	let dateFilter
	if (timeRangeOption)
		dateFilter = {
			$and: [{ date: { $gte: timeRangeOption.from } }, { date: { $lte: timeRangeOption.to } }]
		}
	else dateFilter = { date: moment().format('YYYY-MM-DD') }
	return await AttendanceModel.aggregate().match({
		student: new mongoose.Types.ObjectId(studentId),
		...dateFilter
	})
}

// Reset form save attandance by class
export const getClassAttendanceBySession = async (headTeacher: string, date: string | undefined, session: string) => {
	if (!!date && !moment(date).isValid()) throw createHttpError.BadRequest('Invalid date')
	const attendanceClass = await ClassModel.findOne({ headTeacher: headTeacher }).select('_id className')
	const studentsByClass = (await StudentModel.find({ class: attendanceClass?._id })
		.select('_id fullName')
		.lean()) as Array<Pick<IStudent, '_id' | 'fullName'>>
	let attendanceOfClass = (await AttendanceModel.find({
		student: { $in: studentsByClass.map((std) => std._id) },
		date: moment(date).format('YYYY-MM-DD'),
		session: AttendanceSessionEnum[session as keyof typeof AttendanceSessionEnum]
	})
		.populate({
			path: 'student',
			select: '_id fullName',
			options: { sort: { fullName: 'asc' }, lean: true }
		})
		.select('-session -createdAt -updatedAt -date')) as Array<Pick<IAttendance, 'student' | 'isPresent'>>

	if (!attendanceOfClass.length)
		attendanceOfClass = studentsByClass.map(
			(std) => ({ student: std, isPresent: true } as Pick<IAttendance, 'student' | 'isPresent'>)
		)
	return {
		class: attendanceClass?.className,
		session: AttendanceSessionEnum[session as keyof typeof AttendanceSessionEnum],
		date: moment(date).format('DD/MM/YYYY'),
		attendances: attendanceOfClass
	}
}
