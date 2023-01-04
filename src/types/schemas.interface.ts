import { ObjectId, Document } from "mongoose";

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
	morning: [2, 3, 4, 5][];
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
		subject: [ObjectId];
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
	schoolYear: ObjectId;
	parentPhoneNumber: string;
	absents: Array<{
		_id?: ObjectId;
		date: Date;
		haPermision: boolean;
		reason: string;
	}>;
}

export interface Subject extends Document {
	_id?: ObjectId;
	subjectName: string;
}

// export interface bangDiem {
// 	student: ObjectId;
// 	results: [
// 		{
// 			subject: ObjectId; // ref subject
// 			hangMuc: [
// 				{
// 					giuaKy:
// 				}
// 			]

// 		},
// 	];
// }

/*
[
	{
		limit:5
		page: 1,
		docs:[
			{
				id:1
				name:'abc'
			},
			{
				id:1
				name:'abc'
			},
			{
				id:1
				name:'abc'
			},
			{
				id:1
				name:'abc'
			},
		]
	}	
]
	
 */
