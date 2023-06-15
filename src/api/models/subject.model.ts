import mongoose from 'mongoose';
import MongooseDelete from 'mongoose-delete';
import { createSlug } from '../../helpers/toolkit';
import { TSoftDeleteSubjectModel, ISubjectDocument } from '../../types/subject.type';

const subjectSchema = new mongoose.Schema<ISubjectDocument>(
	{
		subjectName: String,
		slug: {
			type: String,
			unique: true
		}
	},
	{
		collection: 'subjects',
		timestamps: true
	}
);

subjectSchema.plugin(MongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true
});

subjectSchema.pre('save', function (next) {
	this.slug = createSlug(this.subjectName);

	next();
});

const SubjectModel: TSoftDeleteSubjectModel = mongoose.model<ISubjectDocument, TSoftDeleteSubjectModel>(
	'Subjects',
	subjectSchema
);

export default SubjectModel;
