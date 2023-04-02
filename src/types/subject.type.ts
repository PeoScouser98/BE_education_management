import { Model, ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export interface ISubject extends Document {
	_id: ObjectId;
	subjectName: string;
	slug?: string;
}

export interface ISubjectDocument extends Omit<SoftDeleteDocument, '_id'>, ISubject {}

export type ISubjectModel = Model<ISubjectDocument>;

export type ISoftDeleteSubjectModel = SoftDeleteModel<ISubjectDocument, ISubjectModel>;
