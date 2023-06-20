/* eslint-disable no-useless-catch */
import { ISchoolYear } from '../../types/schoolYear.type';
import SchoolYearModel from '../models/schoolYear.model';
import createHttpError from 'http-errors';

// lấy ra toàn bộ các năm học
export const getAllSchoolYear = async (limit: number, page: number) => {
	return await SchoolYearModel.paginate(
		{},
		{
			limit: limit,
			page: page,
			sort: { startAt: 'asc' }
		}
	);
};

// tạo mới 1 năm học
export const createSchoolYear = async () => {
	const schoolYearExist: ISchoolYear | null = await SchoolYearModel.findOne({
		startAt: new Date().getFullYear(),
		endAt: new Date().getFullYear() + 1
	});

	// schoolyear đã tồn tại
	if (schoolYearExist) {
		throw createHttpError(
			409,
			`The academic year ${schoolYearExist.startAt}-${schoolYearExist.endAt} already exists`
		);
	}

	return await new SchoolYearModel({}).save();
};

// lấy ra schoolYear hiện tại
export const getCurrentSchoolYear = async () => {
	const schoolYear = await SchoolYearModel.findOne({
		$and: [{ startAt: { $lte: new Date().getFullYear() } }, { endAt: { $gte: new Date().getFullYear() } }]
	});

	if (!schoolYear) {
		throw createHttpError(404, 'The new academic year has not started yet, please come back later');
	}

	return schoolYear;
};
