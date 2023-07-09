import { Model, PaginateModel } from 'mongoose'
import { ObjectId } from 'mongoose'
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ILearningMaterial {
	_id: string
	subject: ObjectId
	grade: number
	fileId: string
	fileName: string
	mimeType: string
	downloadUrl: string
}
export interface ILearningMaterialDocument extends ILearningMaterial, Omit<SoftDeleteDocument, '_id'> {}
export type TLearningMaterialModel = Model<ILearningMaterial>
export type TSoftDeleteModel = SoftDeleteModel<ILearningMaterialDocument, TLearningMaterialModel>
export type TPaginateModel = PaginateModel<ILearningMaterial>
