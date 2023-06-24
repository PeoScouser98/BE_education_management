import { Model, ObjectId, PaginateModel } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { IUser } from './user.type';

export interface IStudent extends Document {
	_id: ObjectId;
	code: string;
	fullName: string;
	gender: string;
	dateOfBirth: Date;
	class: ObjectId;
	parents: ObjectId | Pick<IUser, '_id' | 'email' | 'phone' | 'displayName' | 'address'>;
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
export interface IStudentRemark extends Document {
	_id: ObjectId;
	student: ObjectId | Pick<IStudent, '_id' | 'fullName' | 'class'>;
	conduct: StudentQualityEnum;
	proficiency: StudentQualityEnum;
	remark: string;
	remarkedBy: string | ObjectId | Pick<IUser, '_id' | 'displayName'>;
}
export enum StudentQualityEnum {
	BAD = 'Yếu',
	NORMAL = 'Trung bình',
	OK = 'Khá',
	GOOD = 'Tốt'
}

export interface IStudentDocument extends Omit<SoftDeleteDocument, '_id'>, IStudent {}
export type TStudentModel = Model<IStudentDocument>;
export type TSoftDeleteStudentModel = SoftDeleteModel<IStudentDocument, TStudentModel>;
export type TPaginatedStudentModel = PaginateModel<IStudentDocument>;
