import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { Model, ObjectId } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { generateStudentID } from '../../helpers/toolkit';

export interface Student extends Document {
	_id: ObjectId;
	code: string;
	fullName: string;
	gender: boolean;
	dateOfBirth: Date;
	class: ObjectId;
	parentsPhoneNumber: string;
	isPolicyBeneficiary?: boolean;
	isGraduated?: boolean;
	absentDays?: IAttendance[];
}

export interface IAttendance extends Document {
	_id: ObjectId;
	date: Date;
	hasPermision: boolean;
	reason: string;
}

interface StudentDocument extends Omit<SoftDeleteDocument, '_id'>, Student {}

interface ClassModel extends Model<StudentDocument> {}

interface SoftDeleteStudentModel extends SoftDeleteModel<StudentDocument, ClassModel> {}

const StudentSchema = new mongoose.Schema<StudentDocument>(
	{
		code: {
			type: String,
			unique: true,
		},
		class: {
			type: mongoose.Types.ObjectId,
			ref: 'Classes',
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
		parentsPhoneNumber: {
			type: String,
			require: true,
		},
		isPolicyBeneficiary: {
			type: Boolean,
			default: false,
		},
		isGraduated: {
			type: Boolean,
			default: false,
		},
		absentDays: [
			{
				date: {
					type: Date,
					default: new Date(),
				},
				schoolYear: {
					type: mongoose.Types.ObjectId,
					ref: 'SchoolYears',
					autopopulate: true,
				},
				hasPermision: { type: Boolean, default: false },
				reason: {
					type: String,
					minlength: 8,
					maxLength: 256,
					default: 'Không có lý do',
				},
			},
		],
	},
	{
		timestamps: true,
		collection: 'students',
	}
);

StudentSchema.plugin(mongooseDelete, { overrideMethods: ['find', 'findOne'], deletedAt: true });
StudentSchema.plugin(mongooseAutoPopulate);

StudentSchema.pre('save', function (next) {
	this.code = generateStudentID(this.fullName, this.parentsPhoneNumber);

	next();
});

StudentSchema.pre('insertMany', function (next, docs) {
	docs.forEach((item: any, index: number) => {
		let code = generateStudentID(item.fullName, item.parentsPhoneNumber);
		docs[index].code = code;
	});

	next();
});

const StudentModel: SoftDeleteStudentModel = mongoose.model<
	StudentDocument,
	SoftDeleteStudentModel
>('Students', StudentSchema);

export default StudentModel;
