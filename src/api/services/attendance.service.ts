import createHttpError from 'http-errors'
import moment from 'moment'
import mongoose, { isValidObjectId } from 'mongoose'
import { IAttendance } from '../../types/attendance.type'
import AttendanceModel from '../models/attendance.model'
import StudentModel from '../models/student.model'
import { validateAttedancePayload } from '../validations/attendance.validation'
import { AttendanceSessionEnum } from './../../types/attendance.type'
import ClassModel from '../models/class.model'

export const saveAttendanceByClass = async (payload: Array<Omit<IAttendance, '_id'>>, session: string) => {
	const { error } = validateAttedancePayload(payload)
	if (error) throw createHttpError.BadRequest(error.message)

	const bulkWriteOption: any = payload.map((atd: Omit<IAttendance, '_id'>) => ({
		updateOne: {
			filter: {
				student: atd.student,
				session: AttendanceSessionEnum[session],
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
export const getClassAttendanceBySession = async (headTeacher: string, date: string | undefined, ss: string) => {
	if (!!date && !moment(date).isValid()) throw createHttpError.BadRequest('Invalid date')
	const classId = await ClassModel.findOne({ headTeacher: headTeacher }).distinct('_id')
	console.log('classId', classId)
	const studentsByClass = await StudentModel.find({ class: classId }).select('_id fullName').lean()
	let attendanceOfClass = await AttendanceModel.find({
		student: { $in: studentsByClass.map((std) => std._id) },
		date: moment(date).format('YYYY-MM-DD'),
		session: AttendanceSessionEnum[ss]
	})

		.populate({
			path: 'student',
			select: '_id fullName',
			options: { sort: { fullName: 'asc' }, lean: true }
		})
		.select('-session -createdAt -updatedAt -date -_id')
	if (!attendanceOfClass.length) attendanceOfClass = studentsByClass.map((std) => ({ student: std, isPresent: true }))
	return {
		session: AttendanceSessionEnum[ss],
		date: moment(date).format('DD/MM/YYYY'),
		attendances: attendanceOfClass
	}
}
