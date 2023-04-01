import { Model, PaginateModel } from 'mongoose';
import { ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export interface ILearningMaterial {
	_id: string;
	subject: ObjectId;
	grade: number;
	fileId: string;
	fileName: string;
	mimeType: string;
	downloadUrl: string;
}
export interface ILearningMaterialDocument
	extends ILearningMaterial,
		Omit<SoftDeleteDocument, '_id'> {}
export type ILearningMaterialModel = Model<ILearningMaterial>;
export type ISoftDeleteModel = SoftDeleteModel<ILearningMaterialDocument, ILearningMaterialModel>;
export type IPaginateModel = PaginateModel<ILearningMaterial>;
