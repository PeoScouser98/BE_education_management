/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import createHttpError from 'http-errors'
import _ from 'lodash'
import mongoose from 'mongoose'
import { ITimeTable } from '../../types/timeTable.type'
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
	const result = await TimeTableModel.find({
		teacher: teacherId
	})
		.populate({ path: 'class', select: '_id className', options: { lean: true } })
		.populate({ path: 'subject', select: '_id subjectName', options: { lean: true } })
	return _.groupBy(result, 'dayOfWeek')
}
