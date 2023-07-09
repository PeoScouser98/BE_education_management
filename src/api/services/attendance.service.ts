import { AttendanceSessionEnum } from './../../types/attendance.type'
import createHttpError from 'http-errors'
import moment from 'moment'
import * as mongodb from 'mongodb'
import { IAttendance } from '../../types/attendance.type'
import AttendanceModel from '../models/attendance.model'
import StudentModel from '../models/student.model'
import { validateAttedancePayload } from '../validations/attendance.validation'
import mongoose, { isValidObjectId } from 'mongoose'

export const saveAttendanceByClass = async (payload: Array<Omit<IAttendance, '_id'>>) => {
	// validate
	const { error } = validateAttedancePayload(payload)
	if (error) throw createHttpError.BadRequest(error.message)
	const bulkWriteOption: mongodb.AnyBulkWriteOperation<Omit<IAttendance, '_id'>>[] = payload.map(
		(atd: Omit<IAttendance, '_id'>) => ({
			updateOne: {
				filter: {
					student: atd.student,
					session: atd.session,
					date: moment().format('YYYY-MM-DD')
				},
				update: atd,
				upsert: true
			}
		})
	)
	const result = await AttendanceModel.bulkWrite(bulkWriteOption)

	return { message: 'Save attendance successfully !' }
}

// Follow attendance of entire school
export const getAttendanceByClass = async (classId: string, date?: string) => {
	if (!!date && !moment(date).isValid()) throw createHttpError.BadRequest('Invalid date')
	const studentsByClass = await StudentModel.find({ class: classId }).distinct('_id')
	let result = await AttendanceModel.aggregate()
		.match({
			student: { $in: studentsByClass },
			date: moment(date).format('YYYY-MM-DD')
		})
		.lookup({
			from: 'students',
			localField: 'student',
			foreignField: '_id',
			as: 'student',
			pipeline: [
				{
					$project: {
						_id: 1,
						fullName: 1
					}
				}
			]
		})
		.unwind('$student')
		.group({
			_id: { student: '$student', date: '$date' },
			student: { $first: '$student' },
			date: { $first: '$date' },
			attendance: {
				$push: {
					k: {
						$cond: {
							if: { $eq: ['$session', AttendanceSessionEnum.MORNING] },
							then: 'morning',
							else: 'afternoon'
						}
					},
					v: {
						isPresent: '$isPresent',
						reason: '$reason'
					}
				}
			}
		})
		.addFields({
			attendance: { $arrayToObject: '$attendance' }
		})
		.project({
			_id: 0,
			student: 1,
			attendance: 1
		})
		.sort({ createdAt: -1, student: 1 })

	result = result.map((v) => ({
		...v,
		morning: v.attendance?.morning,
		afternoon: v.attendance?.afternoon ?? null,
		attendance: undefined
	}))
	return {
		date: moment(date).format('DD/MM/YYYY'),
		result
	}
}

export const studentAttendance = async (studentId: string, timeRangeOption?: { from: string; to: string }) => {
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
export const getTodayClassAttendanceBySession = async (classId: string, date: string, ss: string) => {
	if (!!date && !moment(date).isValid()) throw createHttpError.BadRequest('Invalid date')
	const studentsByClass = await StudentModel.find({ class: classId }).distinct('_id')
	const attendanceOfClass = await AttendanceModel.find({
		student: { $in: studentsByClass },
		date: moment(date).format('YYYY-MM-DD'),
		session: AttendanceSessionEnum[ss] as string
	})
		.populate({ path: 'student', select: '_id fullName', options: { lean: true } })
		.select('-session -createdAt -updatedAt -date')
	return {
		session: AttendanceSessionEnum[ss],
		date: moment(date).format('DD/MM/YYYY'),
		attendances: attendanceOfClass
	}
}
