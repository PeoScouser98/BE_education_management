import { Document, ObjectId } from "mongoose";

interface User {
	email?: string;
	phone?: string;
	password: string;
}

export interface Class extends Document {
	_id: ObjectId;
	grade: string;
	className: string;
	headTeacher: ObjectId;
}

export interface EduBackground extends Document {
	_id?: ObjectId;
	level: string;
}
export interface SchoolYear extends Document {
	_id?: ObjectId;
	startAt: number;
	endAt: number;
}
export interface TimeTable {
	_id?: ObjectId;
	class: ObjectId;
	morning: {};
	afternoon: [][];
}

export interface Parent extends User, Document {
	phoneNumber: string;
	fullName: string;
	children: Array<ObjectId>;
}

export interface Teacher extends User, Document {
	_id: ObjectId;
	email: string;
	password: string;
	fullName: string;
	phone: string;
	dateOfBirth: Date;
	gender: boolean;
	headClass: ObjectId;
	inChargeOfSpecialities: Array<{
		class: ObjectId;
		subject: Array<ObjectId>;
	}>;
	position: ObjectId;
	eduBackground: ObjectId;
}

export interface Student extends Document {
	_id?: ObjectId;
	fullName: string;
	gender: boolean;
	dateOfBirth: Date;
	class: ObjectId;

	parentPhoneNumber: string;
	schoolTranscript: Array<SubjectTranscript>;
	absentDays: Array<{
		_id?: ObjectId;
		date: Date;
		hasPermision: boolean;
		reason: string;
	}>;
}
export interface SubjectTranscript extends Document {
	schoolYear: ObjectId;
	subject: ObjectId;
	firstSemester: {
		midtermTest?: {
			type: Number;
			min: 0;
			max: 10;
		};
		finalTest: {
			type: Number;
			min: 0;
			max: 10;
		};
	};
	secondSemester: {
		midtermTest?: {
			type: Number;
			min: 0;
			max: 10;
		};
		finalTest: {
			type: Number;
			min: 0;
			max: 10;
		};
	};
}
export interface Subject extends Document {
	_id?: ObjectId;
	subjectName: string;
}
