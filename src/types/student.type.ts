import { Model, ObjectId, PaginateModel } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export interface IStudent extends Document {
	_id: ObjectId;
	code: string;
	fullName: string;
	gender: boolean;
	dateOfBirth: Date;
	class: ObjectId;
	parentsPhoneNumber: string;
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

export interface StudentDocument extends Omit<SoftDeleteDocument, '_id'>, IStudent {}

export type IStudentModel = Model<StudentDocument>;

export type SoftDeleteStudentModel = SoftDeleteModel<StudentDocument, IStudentModel>;

export type IPaginatedStudentModel = PaginateModel<StudentDocument>;
