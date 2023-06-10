import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { Model, ObjectId, PaginateModel } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import mongoosePaginate from 'mongoose-paginate-v2';
import {
	TPaginatedStudentModel,
	TSoftDeleteStudentModel,
	IStudentDocument,
} from '../../types/student.type';

const StudentSchema = new mongoose.Schema<IStudentDocument>(
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
		transferSchool: {
			type: Date,
			default: null,
		},
		dropoutDate: {
			type: Date,
			default: null,
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

StudentSchema.plugin(mongoosePaginate);
StudentSchema.plugin(mongooseDelete, { overrideMethods: ['find', 'findOne'], deletedAt: true });
StudentSchema.plugin(mongooseAutoPopulate);

const StudentModel: TSoftDeleteStudentModel & TPaginatedStudentModel = mongoose.model<
	IStudentDocument,
	TSoftDeleteStudentModel & TPaginatedStudentModel
>('Students', StudentSchema);

export default StudentModel;
