import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongooseDelete from 'mongoose-delete';
import mongoosePaginate from 'mongoose-paginate-v2';
import { toCapitalize } from '../../helpers/toolkit';
import { IStudentDocument, TPaginatedStudentModel, TSoftDeleteStudentModel } from '../../types/student.type';
import { UserGenderEnum } from '../../types/user.type';

const StudentSchema = new mongoose.Schema<IStudentDocument>(
	{
		code: {
			type: String,
			uppercase: true,
			unique: true
		},
		class: {
			type: mongoose.Types.ObjectId,
			ref: 'Classes'
		},
		fullName: {
			type: String,
			require: true,
			trim: true,
			minLength: 6
		},
		parents: {
			type: mongoose.Types.ObjectId,
			ref: 'Users',
			autopopulate: { select: '_id displayName phone', options: { lean: true } }
		},
		gender: {
			type: String,
			require: true,
			enum: Object.values(UserGenderEnum)
		},
		dateOfBirth: {
			type: Date,
			require: true
		},
		isPolicyBeneficiary: {
			type: Boolean,
			default: false
		},
		isGraduated: {
			type: Boolean,
			default: false
		},
		transferSchool: {
			type: Date,
			default: null
		},
		dropoutDate: {
			type: Date,
			default: null
		},
		absentDays: {
			type: [
				{
					date: {
						type: Date,
						default: new Date()
					},
					schoolYear: {
						type: mongoose.Types.ObjectId,
						ref: 'SchoolYears'
						// autopopulate: true
					},
					hasPermision: { type: Boolean, default: false },
					reason: {
						type: String,
						minlength: 8,
						maxLength: 256,
						default: 'Không có lý do'
					}
				}
			],
			default: []
		}
	},
	{
		versionKey: false,
		timestamps: true,
		collection: 'students'
	}
);

StudentSchema.plugin(mongoosePaginate);
StudentSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true
});
StudentSchema.plugin(mongooseAutoPopulate);

const StudentModel: TSoftDeleteStudentModel & TPaginatedStudentModel = mongoose.model<
	IStudentDocument,
	TSoftDeleteStudentModel & TPaginatedStudentModel
>('Students', StudentSchema);

StudentSchema.pre('save', function () {
	this.fullName = toCapitalize(this.fullName) as string;
});

export default StudentModel;
