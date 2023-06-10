import { ObjectId, PaginateModel } from 'mongoose';

export interface ISchoolYear extends Document {
	_id: ObjectId;
	startAt: number;
	endAt: number;
}

export type TPaginatedSchoolYearModel = PaginateModel<ISchoolYear>;
