import { ObjectId, StringSchemaDefinition } from "mongoose";

export interface Student {
	_id?: string;
	fullName: string;
	gender: boolean;
	dateOfBirth: Date;
	class: ObjectId;
	schoolYear: string;
	parentPhoneNumber: string;
	attendance: Array<{
		_id?: string;
		date: Date;
		isPresent: boolean;
		reason: string;
	}>;
}