import { ObjectId, PaginateModel } from 'mongoose';

export interface SchoolYear extends Document {
	_id: ObjectId;
	startAt: number;
	endAt: number;
}

export type IPaginatedSchoolYearModel = PaginateModel<SchoolYear>;
