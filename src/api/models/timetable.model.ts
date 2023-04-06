import mongoose, { ObjectId } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';

import { ISubject } from '../../types/subject.type';
import { ITimetable } from '../../types/timeTable.type';

const TimetableSchema = new mongoose.Schema({
	class: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Class',
		required: true,
	},
	dayOfWeek: {
		type: Number,
		enum: [2, 3, 4, 5, 6],
		require: true,
	},
	period: {
		type: Number,
		enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	},
	subject: {
		type: mongoose.Types.ObjectId,
		ref: 'Subjects',
		require: true,
		autopopulate: true,
	},
	teacher: {
		type: mongoose.Types.ObjectId,
		ref: 'Users',
		autopopulate: { select: 'username _id' },
	},
});

TimetableSchema.plugin(mongooseAutoPopulate);

const TimetableModel = mongoose.model<ITimetable>('Timetables', TimetableSchema);

export default TimetableModel;
