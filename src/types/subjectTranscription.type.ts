import { Model, ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { ISubject } from './subject.type';

export interface ISubjectTranscript extends Document {
	_id: ObjectId;
	student: ObjectId;
	schoolYear: ObjectId;
	subject: ObjectId | string | Partial<ISubject>;
	isPassed?: boolean;
	remark?: string;
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

export interface ISubjectTranscriptDocument extends Omit<SoftDeleteDocument, '_id'>, ISubjectTranscript {}

export type TSubjectTranscriptModel = Model<ISubjectTranscriptDocument>;

export type TSoftDeleteSubjectTranscriptModel = SoftDeleteModel<ISubjectTranscriptDocument, TSubjectTranscriptModel>;
