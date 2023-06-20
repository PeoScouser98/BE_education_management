import mongoose from 'mongoose';
import MongooseDelete from 'mongoose-delete';
import { toCapitalize } from '../../helpers/toolkit';
import { ISubjectDocument, TSoftDeleteSubjectModel } from '../../types/subject.type';

const SubjectSchema = new mongoose.Schema<ISubjectDocument>(
	{
		subjectName: {
			type: String,
			required: true
		},
		subjectCode: {
			type: String,
			unique: true,
			uppercase: true,
			required: true
		}
	},
	{
		versionKey: false,
		collection: 'subjects',
		timestamps: true
	}
);

SubjectSchema.plugin(MongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true
});

SubjectSchema.pre('save', function (next) {
	this.subjectName = toCapitalize(this.subjectName)!;
	next();
});

const SubjectModel: TSoftDeleteSubjectModel = mongoose.model<ISubjectDocument, TSoftDeleteSubjectModel>(
	'Subjects',
	SubjectSchema
);

export default SubjectModel;
