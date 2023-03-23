import mongooseDelete from 'mongoose-delete';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose from 'mongoose';
import { Subject } from './subject.model';

export interface LearningMaterial extends Document {
	_id: string;
	subject: Subject;
	grade: number;
	fileId: string;
	downloadUrl: string;
}

const LearningMaterialSchema = new mongoose.Schema<LearningMaterial>({
	subject: {
		type: mongoose.Types.ObjectId,
		ref: 'Subjects',
		require: true,
		autopopulate: true,
	},
	grade: {
		type: Number,
		enum: [1, 2, 3, 4, 5],
		require: true,
	},
	fileId: {
		type: String,
		require: true,
	},
	downloadUrl: {
		type: String,
		default: '',
	},
});

LearningMaterialSchema.plugin(mongooseAutoPopulate, mongooseDelete);

const LearningMaterialModel = mongoose.model<LearningMaterial>(
	'learning_materials',
	LearningMaterialSchema
);

export default LearningMaterialModel;
