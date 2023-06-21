import { Model, ObjectId, PaginateModel } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export interface IStudent extends Document {
	_id: ObjectId;
	code: string;
	fullName: string;
	gender: string;
	dateOfBirth: Date;
	class: ObjectId;
	parents: ObjectId;
	isPolicyBeneficiary?: boolean;
	isGraduated?: boolean;
	transferSchool?: Date;
	dropoutDate?: Date;
	absentDays?: IAttendance[];
}

export interface IAttendance extends Document {
	_id: ObjectId;
	date: Date;
	hasPermision?: boolean;
	reason?: string;
}

export interface IStudentDocument extends Omit<SoftDeleteDocument, '_id'>, IStudent {}

export type TStudentModel = Model<IStudentDocument>;

export type TSoftDeleteStudentModel = SoftDeleteModel<IStudentDocument, TStudentModel>;

export type TPaginatedStudentModel = PaginateModel<IStudentDocument>;
