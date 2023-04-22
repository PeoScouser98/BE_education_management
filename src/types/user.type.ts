import { Model } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export enum UserGenderEnum {
	MALE = 'Nam',
	FEMALE = 'Nữ',
}

export enum UserRoleEnum {
	HEADMASTER = 'Headmaster',
	TEACHER = 'Teacher',
	PARENTS = 'Parents',
}

export interface IUser {
	_id: string;
	email: string;
	displayName: string;
	password?: string;
	picture: string;
	dateOfBirth: Date;
	gender: UserGenderEnum;
	phone: string;
	role: UserRoleEnum;
	eduBackground?: {
		universityName: string;
		graduatedAt: Date;
		qualification: string;
	};
	employmentStatus?: boolean;
	isVerified: boolean;
	verifyPassword: (password: string) => boolean;
}

export interface IUserDocument extends IUser, Omit<SoftDeleteDocument, '_id'> {}
export type IUserModel = Model<IUserDocument>;
export type ISoftDeleteUserModel = SoftDeleteModel<IUserDocument, IUserModel>;
