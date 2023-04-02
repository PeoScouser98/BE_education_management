import mongoose, { Model, ObjectId } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { IClassDocument, ISoftDeleteClassModel } from '../../types/class.type';

const ClassSchema = new mongoose.Schema<IClassDocument>(
	{
		className: {
			type: String,
			require: true,
			trim: true,
			uppercase: true,
			unique: true,
		},
		grade: {
			type: Number,
			enum: [1, 2, 3, 4, 5],
			require: true,
		},
		headTeacher: {
			type: mongoose.Types.ObjectId,
			ref: 'Teachers',
			autopopulate: { select: '_id fullName phone email' },
		},
	},
	{
		collection: 'classes',
		timestamps: true,
	}
);

ClassSchema.plugin(mongooseDelete, { overrideMethods: ['find', 'findOne'], deletedAt: true });

ClassSchema.virtual('students', {
	localField: '_id',
	foreignField: 'class',
	ref: 'students',
});

const ClassModel: ISoftDeleteClassModel = mongoose.model<IClassDocument, ISoftDeleteClassModel>(
	'Classes',
	ClassSchema
);

export default ClassModel;
