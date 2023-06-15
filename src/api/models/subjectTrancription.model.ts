import mongoose from 'mongoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongooseDelete from 'mongoose-delete';
import { TSoftDeleteSubjectTranscriptModel, ISubjectTranscriptDocument } from '../../types/subjectTranscription.type';

const SubjectTranscriptSchema = new mongoose.Schema<ISubjectTranscriptDocument>(
	{
		student: {
			type: mongoose.Types.ObjectId,
			require: true,
			ref: 'Students',
			autopopulate: { select: 'fullName _id class' }
		},
		schoolYear: {
			type: mongoose.Types.ObjectId,
			ref: 'SchoolYears',
			autopopulate: true,
			require: true
		},
		subject: {
			type: mongoose.Types.ObjectId,
			require: true,
			ref: 'Subjects',
			autopopulate: { select: 'subjectName' }
		},
		firstSemester: {
			midtermTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10
			},
			finalTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10
			}
		},
		secondSemester: {
			midtermTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10
			},
			finalTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10
			}
		}
	},
	{
		collection: 'subject_transcriptions'
	}
);

SubjectTranscriptSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true
});
SubjectTranscriptSchema.plugin(mongooseAutoPopulate);

const SubjectTranscriptionModel: TSoftDeleteSubjectTranscriptModel = mongoose.model<
	ISubjectTranscriptDocument,
	TSoftDeleteSubjectTranscriptModel
>('SubjectTranscriptions', SubjectTranscriptSchema);

export default SubjectTranscriptionModel;
