import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

import { ITimeTable } from '../../types/timeTable.type';

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
			require: true,
			autopopulate: { select: 'subjectName _id' }
		},
		teacher: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			require: true,
			autopopulate: { select: 'displayName _id', options: { id: false } }
		}
	},
	{
		_id: false
	}
);
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
		collection: 'time_tables'
	}
);

TimeTableSchema.plugin(mongooseAutoPopulate);

const TimeTableModel = mongoose.model<ITimeTable>('TimeTables', TimeTableSchema);

export default TimeTableModel;
