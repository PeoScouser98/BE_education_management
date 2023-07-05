import { Model, ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { ISubject } from './subject.type';

export interface ISubjectTranscript extends Document {
	_id: ObjectId;
	student: ObjectId;
	schoolYear: ObjectId;
	subject: ObjectId | string | Partial<ISubject>;
	isPassed?: boolean;
	firstSemester?: {
		midtermTest?: number;
		finalTest: number;
	};
	secondSemester?: {
		midtermTest?: number;
		finalTest: number;
	};
}

export interface ISubjectTranscriptDocument extends Omit<SoftDeleteDocument, '_id'>, ISubjectTranscript {}

export type TSubjectTranscriptModel = Model<ISubjectTranscriptDocument>;

export type TSoftDeleteSubjectTranscriptModel = SoftDeleteModel<ISubjectTranscriptDocument, TSubjectTranscriptModel>;
