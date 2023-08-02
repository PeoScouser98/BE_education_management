/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import createHttpError from 'http-errors'
import _ from 'lodash'
import mongoose from 'mongoose'
import { ITimeTable } from '../../types/timeTable.type'
import StudentModel from '../models/student.model'
import TimeTableModel from '../models/timeTable.model'
import { validateTimeTableData } from '../validations/timeTable.validation'

export const saveTimeTableByClass = async (payload: { [key: string]: Partial<ITimeTable>[] }, classId: string) => {
	const schedule = _.flatMap(payload, (items, dayOfWeek) =>
		items.map((item) => {
			const { createdAt, updatedAt, ...rest } = item
			return { dayOfWeek, class: classId, ...rest }
		})
	)

	const existedLectures = await schedule.reduce<Promise<Partial<ITimeTable>[]>>(async (accumulator, currentValue) => {
		const extLecture = await TimeTableModel.findOne({
			class: { $ne: currentValue.class },
			period: currentValue.period,
			teacher: currentValue.teacher,
			dayOfWeek: currentValue.dayOfWeek
		})

		const currAcc = await Promise.resolve(accumulator)
		if (extLecture) currAcc.push(extLecture.toObject())
		return currAcc
	}, Promise.resolve([]))

	if (existedLectures.length > 0) {
		const errData = payload
		Object.keys(errData).forEach((dayOfWeek) => {
			existedLectures.forEach((i) => {
				if (i.dayOfWeek === dayOfWeek) {
					errData[dayOfWeek] = errData[dayOfWeek].map((j) => {
						if (j.period === i.period) {
							return {
								...j,
								subject: '',
								teacher: ''
							}
						} else return j
					})
				}
			})
		})
		return {
			error: createHttpError.Conflict('Một sô giáo viên đã bị trùng lịch dạy'),
			errData: errData,
			payload: payload
		}
	}
	const { error } = validateTimeTableData(schedule)
	if (error) {
		throw createHttpError.BadRequest(error.message)
	}

	// * Using mongodb.AnyBulkWriteOperation<T> causes lagging for Typescript intellisense
	const bulkWriteOptions: any = schedule.map((scd) => {
		return {
			updateOne: {
				filter: {
					_id: new mongoose.Types.ObjectId(scd._id)
				},
				update: scd,
				upsert: true
			}
		}
	})

	await TimeTableModel.bulkWrite(bulkWriteOptions)
	return {
		originalData: schedule,
		errData: null,
		error: null
	}
}

export const getTimeTableDetail = async (classId: string) => {
	console.log(1)
	const data = await TimeTableModel.find({ class: classId })
		.populate({ path: 'subject', select: '_id subjectName', options: { lean: true } })
		.populate({ path: 'teacher', select: '_id displayName', options: { lean: true } })
		.transform((docs) => docs.map((doc) => doc.toObject()))
	const result = _.groupBy(data, 'dayOfWeek')
	return result
}

export const getTimetableByClass = async (classId: string) => {
	const data = await TimeTableModel.find({ class: classId }).transform((docs) => docs.map((doc) => doc.toObject()))
	return _.groupBy(data, 'dayOfWeek')
}

export const getTeacherTimeTable = async (teacherId: string) => {
	const result = await TimeTableModel.aggregate()
		.match({ teacher: new mongoose.Types.ObjectId(teacherId) })
		.lookup({
			from: 'classes',
			localField: 'class',
			foreignField: '_id',
			as: 'class'
		})
		.lookup({
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subject'
		})
		.project({
			dayOfWeek: 1,
			period: 1,
			class: { $arrayElemAt: ['$class.className', 0] },
			subject: { $arrayElemAt: ['$subject.subjectName', 0] }
		})
		.group({
			_id: '$dayOfWeek',
			schedules: {
				$push: {
					dayOfWeek: '$dayOfWeek',
					period: '$period',
					class: '$class',
					subject: '$subject'
				}
			}
		})
		.sort({ _id: 1, 'schedules.period': 1 })

	const timetable = result.reduce((acc, curr) => {
		acc[curr._id] = curr.schedules
		return acc
	}, {})

	return timetable
	// return result
}

export const getStudentTimeTable = async (studentId: string) => {
	const [classOfStudent] = await StudentModel.findOne({ _id: studentId }).distinct('class')
	if (!classOfStudent) throw createHttpError.NotFound('Cannot find time table of student !')
	const timeTable = await getTimeTableDetail(classOfStudent)
	return timeTable
}
