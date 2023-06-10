import mongoose, { Model, ObjectId } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { IClassDocument, TSoftDeleteClassModel } from '../../types/class.type';
import mongooseAutoPopulate from 'mongoose-autopopulate';

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
			ref: 'Users',
			autopopulate: { select: '_id displayName phone email' },
		},
	},
	{
		collection: 'classes',
		timestamps: true,
	}
);
ClassSchema.plugin(mongooseAutoPopulate);
ClassSchema.plugin(mongooseDelete, { overrideMethods: ['find', 'findOne'], deletedAt: true });

ClassSchema.virtual('students', {
	localField: '_id',
	foreignField: 'class',
	ref: 'students',
});

const ClassModel: TSoftDeleteClassModel = mongoose.model<IClassDocument, TSoftDeleteClassModel>(
	'Classes',
	ClassSchema
);

export default ClassModel;
