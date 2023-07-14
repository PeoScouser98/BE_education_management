import createHttpError from 'http-errors'
import _ from 'lodash'
import mongoose from 'mongoose'
import { ITimeTable } from '../../types/timeTable.type'
import TimeTableModel from '../models/timeTable.model'
// import * as mongodb from 'mongodb'

export const saveTimeTableByClass = async (
	payload: { [key: string]: Pick<ITimeTable, 'subject' | 'teacher' | 'period'>[] },
	classId: string
) => {
	const schedule = _.flatMap(payload, (items, dayOfWeek) =>
		items.map((item) => ({
			...item,
			class: classId,
			dayOfWeek: dayOfWeek
		}))
	) as Array<Omit<ITimeTable, '_id'>>

	const existedLectureCount = await schedule.reduce<Promise<number>>(async (accumulator, currentValue) => {
		const extCount = await TimeTableModel.count({
			class: { $ne: currentValue.class },
			period: currentValue.period,
			teacher: currentValue.teacher
		})
		const currAcc = await Promise.resolve(accumulator)
		return currAcc + extCount
	}, Promise.resolve(0))

	if (existedLectureCount > 0) {
		throw createHttpError.Conflict('Duplicated lecture in your time table !')
	}

	const bulkWriteOptions: any = schedule.map((scd) => {
		return {
			updateOne: {
				filter: {
					teacher: scd.teacher,
					dayOfWeek: scd.dayOfWeek,
					period: scd.period,
					class: new mongoose.Types.ObjectId(classId.toString())
				},
				update: scd,
				upsert: true
			}
		}
	})

	await TimeTableModel.bulkWrite(bulkWriteOptions)

	return schedule
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

export const getTeacherTimeTableByClass = async (teacherId: string) => {
	const result = await TimeTableModel.find({
		teacher: teacherId
	})
		.populate({ path: 'class', select: '_id className', options: { lean: true } })
		.populate({ path: 'subject', select: '_id subjectName', options: { lean: true } })
	return _.groupBy(result, 'dayOfWeek')
}
