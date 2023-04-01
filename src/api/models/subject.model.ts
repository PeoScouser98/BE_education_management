import mongoose, { Model, ObjectId } from 'mongoose';
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { createSlug } from '../../helpers/toolkit';

export interface Subject extends Document {
	_id: ObjectId;
	subjectName: string;
	slug?: string;
}

interface SubjectDocument extends Omit<SoftDeleteDocument, '_id'>, Subject {}

type SubjectModel = Model<SubjectDocument>

type SoftDeleteSubjectModel = SoftDeleteModel<SubjectDocument, SubjectModel>

const subjectSchema = new mongoose.Schema<SubjectDocument>(
	{
		subjectName: String,
		slug: {
			type: String,
			unique: true,
		},
	},
	{
		collection: 'subjects',
		timestamps: true,
	}
);

subjectSchema.plugin(MongooseDelete, { overrideMethods: ['find', 'findOne'], deletedAt: true });

subjectSchema.pre('save', function (next) {
	this.slug = createSlug(this.subjectName);

	next();
});

const SubjectModel: SoftDeleteSubjectModel = mongoose.model<
	SubjectDocument,
	SoftDeleteSubjectModel
>('Subjects', subjectSchema);

export default SubjectModel;
