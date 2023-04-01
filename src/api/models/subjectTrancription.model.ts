import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { Model, ObjectId } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export interface SubjectTranscript extends Document {
	_id: ObjectId;
	student: ObjectId;
	schoolYear: ObjectId;
	subject: ObjectId;
	firstSemester?: {
		midtermTest?: {
			type: number;
			min: 0;
			max: 10;
		};
		finalTest?: {
			type: number;
			min: 0;
			max: 10;
		};
	};
	secondSemester?: {
		midtermTest?: {
			type: number;
			min: 0;
			max: 10;
		};
		finalTest?: {
			type: number;
			min: 0;
			max: 10;
		};
	};
}

interface SubjectTranscriptDocument extends Omit<SoftDeleteDocument, '_id'>, SubjectTranscript {}

type ISubjectTranscriptModel = Model<SubjectTranscriptDocument>

type SoftDeleteSubjectTranscriptModel = SoftDeleteModel<SubjectTranscriptDocument, ISubjectTranscriptModel>

const SubjectTranscriptSchema = new mongoose.Schema<SubjectTranscriptDocument>(
	{
		student: {
			type: mongoose.Types.ObjectId,
			require: true,
			ref: 'Students',
			autopopulate: { select: 'fullName _id class' },
		},
		schoolYear: {
			type: mongoose.Types.ObjectId,
			ref: 'SchoolYears',
			autopopulate: true,
			require: true,
		},
		subject: {
			type: mongoose.Types.ObjectId,
			require: true,
			ref: 'Subjects',
			autopopulate: { select: 'subjectName' },
		},
		firstSemester: {
			midtermTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10,
			},
			finalTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10,
			},
		},
		secondSemester: {
			midtermTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10,
			},
			finalTest: {
				type: Number,
				default: 0,
				min: 0,
				max: 10,
			},
		},
	},
	{
		collection: 'subjecttranscriptions',
	}
);

SubjectTranscriptSchema.plugin(mongooseDelete, {
	overrideMethods: ['find', 'findOne'],
	deletedAt: true,
});
SubjectTranscriptSchema.plugin(mongooseAutoPopulate);

const SubjectTranscriptionModel: SoftDeleteSubjectTranscriptModel = mongoose.model<
	SubjectTranscriptDocument,
	SoftDeleteSubjectTranscriptModel
>('SubjectTranscriptions', SubjectTranscriptSchema);

export default SubjectTranscriptionModel;
