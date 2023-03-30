import mongoose, { Document, Model, ObjectId } from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { Subject } from './subject.model';

export interface ILearningMaterial extends SoftDeleteDocument {
	_id: string;
	subject: string | ObjectId;
	grade: number;
	fileId: string;
	fileName: string;
	mimeType: string;
	downloadUrl: string;
}
// interface ILearningMaterialDocument extends SoftDeleteDocument {}
interface ILearningMaterialModel extends Model<ILearningMaterial> {}
interface SoftDeleteLearningMaterialModel
	extends SoftDeleteModel<ILearningMaterial, ILearningMaterialModel> {}

const LearningMaterialSchema = new mongoose.Schema<ILearningMaterial>({
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
		trim: true,
	},
	fileName: {
		type: String,
		required: true,
		trim: true,
	},
	mimeType: {
		type: String,
		required: true,
	},
	downloadUrl: {
		type: String,
		default: '',
	},
});

LearningMaterialSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true,
});
LearningMaterialSchema.plugin(mongooseAutoPopulate);
LearningMaterialSchema.pre('save', function () {
	this.downloadUrl = 'https://drive.google.com/uc?export=download&id=' + this.fileId;
});

const LearningMaterialModel = mongoose.model<ILearningMaterial, SoftDeleteLearningMaterialModel>(
	'learning_materials',
	LearningMaterialSchema
);

export default LearningMaterialModel;
