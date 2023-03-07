import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { ObjectId } from 'mongoose';
export interface Student extends Document {
	_id: ObjectId;
	fullName: string;
	gender: boolean;
	dateOfBirth: Date;
	class: ObjectId;
	parentPhoneNumber: string;
	schoolTranscript: Array<any>;
	isPolicyBeneficiary: boolean;
	absentDays: Array<{
		_id: ObjectId;
		date: Date;
		hasPermision: boolean;
		reason: string;
	}>;
}

const StudentSchema = new mongoose.Schema<Student>({
	_id: {
		type: mongoose.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
	},
	fullName: {
		type: String,
		require: true,
		trim: true,
		minLength: 6,
	},
	gender: {
		type: Boolean,
		require: true,
	},
	dateOfBirth: {
		type: Date,
		require: true,
	},
	parentPhoneNumber: {
		type: String,
		require: true,
	},
	isPolicyBeneficiary: {
		type: Boolean,
		default: false,
	},
	absentDays: [
		{
			date: {
				type: Date,
				default: new Date(),
			},
			schoolYear: { type: mongoose.Types.ObjectId, ref: 'SchoolYear', autopopulate: true },
			hasPermision: { type: Boolean, default: false },
			reason: {
				type: String,
				minlength: 8,
				maxLength: 256,
				default: 'Không có lý do',
			},
		},
	],
});

StudentSchema.plugin(mongooseAutoPopulate);

const StudentModel = mongoose.model<Student>('Students', StudentSchema);

export default StudentModel;
