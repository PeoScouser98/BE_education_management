import mongoose, { ObjectId } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { Subject } from './subject.model';
import { Teacher } from './teacher.model';

export interface Timetable {
	class: ObjectId;
	dayOfWeek: number;
	period: number;
	subject: Subject;
	teacher: Pick<Teacher, 'userId'>;
}

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
		ref: 'Teachers',
		autopopulate: { select: 'fullName _id' },
	},
});

TimetableSchema.plugin(mongooseAutoPopulate);

const TimetableModel = mongoose.model<Timetable>('Timetables', TimetableSchema);

export default TimetableModel;
