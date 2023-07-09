import mongoose from 'mongoose'
import mongooseAutoPopulate from 'mongoose-autopopulate'
import mongooseDelete from 'mongoose-delete'
import mongoosePaginate from 'mongoose-paginate-v2'
import { ILearningMaterialDocument, TPaginateModel, TSoftDeleteModel } from '../../types/learningMaterial.type'

const LearningMaterialSchema = new mongoose.Schema<ILearningMaterialDocument>({
	subject: {
		type: mongoose.Types.ObjectId,
		ref: 'Subjects',
		require: true,
		autopopulate: true
	},
	grade: {
		type: Number,
		enum: [1, 2, 3, 4, 5],
		require: true
	},
	fileId: {
		type: String,
		require: true,
		trim: true
	},
	fileName: {
		type: String,
		required: true,
		trim: true
	},
	mimeType: {
		type: String,
		required: true
	},
	downloadUrl: {
		type: String,
		default: ''
	}
})

// Plugins
LearningMaterialSchema.plugin(mongooseAutoPopulate)
LearningMaterialSchema.plugin(mongoosePaginate)
LearningMaterialSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true
})

// Middleware
LearningMaterialSchema.pre('save', function () {
	this.downloadUrl = 'https://drive.google.com/uc?export=download&id=' + this.fileId
})

const LearningMaterialModel = mongoose.model<ILearningMaterialDocument, TSoftDeleteModel & TPaginateModel>(
	'learning_materials',
	LearningMaterialSchema
)

export default LearningMaterialModel
