import { Model, ObjectId, PaginateModel } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';
import { IUser } from './user.type';
import { IClass } from './class.type';

export interface IStudent extends Document {
	_id: ObjectId;
	code: string;
	fullName: string;
	gender: string;
	dateOfBirth: Date;
	class: ObjectId | string | Partial<IClass>;
	parents: ObjectId | Pick<IUser, '_id' | 'email' | 'phone' | 'displayName' | 'address'>;
	status: StudentStatusEnum;
	isPolicyBeneficiary?: boolean;
	isGraduated?: boolean;
	transferSchoolDate?: Date;
	dropoutDate?: Date;
	absentDays?: IAttendance[];
	remarkOfHeadTeacher?: Pick<IStudentRemark, 'isQualified' | 'conduct' | 'proficiency'> | null;
}

export enum StudentStatusEnum {
	STUDYING = 'Đang học',
	TRANSFER_SCHOOL = 'Chuyển trường',
	DROPPED_OUT = 'Thôi học',
	GRADUATED = 'Hoàn thành chương trình tiểu học'
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
	conduct: string;
	proficiency: string;
	remark: string;
	isQualified: boolean;
	remarkedBy: string | ObjectId | Pick<IUser, '_id' | 'displayName'>;
}

export interface IStudentDocument extends Omit<SoftDeleteDocument, '_id'>, IStudent {}
export type TStudentModel = Model<IStudentDocument>;
export type TSoftDeleteStudentModel = SoftDeleteModel<IStudentDocument, TStudentModel>;
export type TPaginatedStudentModel = PaginateModel<IStudentDocument>;
