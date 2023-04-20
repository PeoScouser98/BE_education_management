import { Document } from 'mongoose';

export enum UserRoleEnum {
	ADMIN = 'ADMIN',
	HEADMASTER = 'HEADMASTER',
	TEACHER = 'TEACHER',
	PARENTS = 'PARENTS',
}

export interface IUser extends Document {
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

export enum UserGenderEnum {
	MALE = 'Nam',
	FEMALE = 'Nữ',
}

export enum UserRoleEnum {
	HEADMASTER = 'Headmaster',
	TEACHER = 'Teacher',
	PARENTS = 'Parents',
}
