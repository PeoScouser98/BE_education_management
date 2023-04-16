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
	password: string;
	picture: string;
	dateOfBirth: Date;
	gender: string;
	phone: string;
	role: string;
	eduBackground?: {
		universityName: string;
		graduatedAt: Date;
		qualification: string;
	};
	employmentStatus?: boolean;
	isVerified: boolean;
}
