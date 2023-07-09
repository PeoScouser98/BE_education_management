import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'

import { ITimeTable } from '../../types/timeTable.type'
import { ISubject } from '../../types/subject.type'
import { IUser } from '../../types/user.type'

const ScheduleSlotSchema = new mongoose.Schema(
	{
		period: {
			type: Number,
			require: true,
			enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
		},
		subject: {
			type: mongoose.Types.ObjectId,
			ref: 'Subjects',
			required: true,
			autopopulate: {
				select: 'subjectName -_id',
				options: { lean: true },
				transform: (doc: Pick<ISubject, 'subjectName'>) => doc?.subjectName ?? ''
			}
		},
		teacher: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			required: true,
			autopopulate: {
				select: 'displayName -_id',
				options: { lean: true },
				transform: (doc: Pick<IUser, 'displayName'>) => doc?.displayName ?? ''
			}
		}
	},
	{
		_id: false
	}
)
const TimeTableSchema = new mongoose.Schema(
	{
		class: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Classes',
			required: true,
			autopopulate: { select: 'className', options: { lean: true } }
		},
		schedule: {
			monday: [ScheduleSlotSchema],
			tuesday: [ScheduleSlotSchema],
			wednesday: [ScheduleSlotSchema],
			thursday: [ScheduleSlotSchema],
			friday: [ScheduleSlotSchema],
			saturday: [ScheduleSlotSchema]
		}
	},
	{
		timestamps: true,
		versionKey: false,
		collection: 'time_tables',
		strictPopulate: false
	}
)

TimeTableSchema.plugin(mongooseAutoPopulate)

const TimeTableModel = mongoose.model<ITimeTable>('TimeTables', TimeTableSchema)

export default TimeTableModel
