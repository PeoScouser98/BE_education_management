import { Document, ObjectId } from 'mongoose';
import { ISubject, ISubjectDocument } from './subject.type';
import { IUser, IUserDocument } from './user.type';
export interface IScheduleSlotTime {
	subject: ObjectId | ISubjectDocument | string;
	teacher: ObjectId | IUserDocument | string;
	period: number;
}

export interface ITimeTable extends Document {
	class: ObjectId;
	schedule: {
		monday: Array<IScheduleSlotTime>;
		tuesday: Array<IScheduleSlotTime>;
		wednesday: Array<IScheduleSlotTime>;
		thursday: Array<IScheduleSlotTime>;
		friday: Array<IScheduleSlotTime>;
		saturday: Array<IScheduleSlotTime>;
	};
	createdAt: Date;
	updatedAt: Date;
}

export enum DayInWeekEnum {
	MONDAY = 'monday',
	TUESDAY = 'tuesday',
	WEDNESSDAY = 'wednesday',
	THURSDAY = 'thursday',
	FRIDAY = 'friday',
	SATURDAY = 'saturday',
}
