import { Document, ObjectId } from 'mongoose'
import { ISubjectDocument } from './subject.type'
import { IUserDocument } from './user.type'
export interface IScheduleSlotTime extends Document {
	subject: ObjectId | ISubjectDocument | string
	teacher: ObjectId | IUserDocument | string
	period: number
}

export interface ITimeTable extends Document {
	class: ObjectId
	schedule: {
		monday: Array<IScheduleSlotTime>
		tuesday: Array<IScheduleSlotTime>
		wednesday: Array<IScheduleSlotTime>
		thursday: Array<IScheduleSlotTime>
		friday: Array<IScheduleSlotTime>
	}
	createdAt: Date
	updatedAt: Date
}

export enum DayInWeekEnum {
	MONDAY = 'monday',
	TUESDAY = 'tuesday',
	WEDNESSDAY = 'wednesday',
	THURSDAY = 'thursday',
	FRIDAY = 'friday'
}
