import mongoose from 'mongoose';
import { StudentQualityEnum } from '../../types/student.type';
import mongooseAutoPopulate from 'mongoose-autopopulate';

const StudentRemarkSchema = new mongoose.Schema(
	{
		student: {
			type: mongoose.Types.ObjectId,
			ref: 'Students',
			required: true,
			autopopulate: { select: '_id fullName', options: { lean: true } }
		},
		schoolYear: {
			type: mongoose.Types.ObjectId,
			ref: 'SchoolYears',
			autopopulate: true
		},
		conduct: {
			// đánh giá phẩm chất
			type: String,
			required: true,
			enum: Object.values(StudentQualityEnum)
		},
		proficiency: {
			// đánh giá năng lực
			type: String,
			required: true,
			enum: Object.values(StudentQualityEnum)
		},
		remark: {
			type: String,
			trim: true
			// required: true
		},
		remarkedBy: {
			type: mongoose.Types.ObjectId,
			required: true,
			ref: 'Users',
			autopopulate: { select: '_id displayName', options: { lean: true } }
		}
	},
	{
		collection: 'student_remarks',
		versionKey: false,
		timestamps: true
	}
);

StudentRemarkSchema.plugin(mongooseAutoPopulate);

const StudentRemarkModel = mongoose.model('StudentRemarks', StudentRemarkSchema);

export default StudentRemarkModel;
