import SchoolYearModel, { SchoolYear } from '../models/schoolYear.model';
import createHttpError from 'http-errors';

// lấy ra toàn bộ các năm học
export const getAllSchoolYear = async (limit: number, page: number) => {
	try {
		return await SchoolYearModel.paginate(
			{},
			{
				limit: limit,
				page: page,
				sort: { startAt: 'asc' },
			}
		);
	} catch (error) {
		throw error;
	}
};

// tạo mới 1 năm học
export const createSchoolYear = async () => {
	try {
		const schoolYearExist: SchoolYear | null = await SchoolYearModel.findOne({
			startAt: new Date().getFullYear(),
			endAt: new Date().getFullYear() + 1,
		});

		// schoolyear đã tồn tại
		if (schoolYearExist) {
			throw createHttpError(
				409,
				`The academic year ${schoolYearExist.startAt}-${schoolYearExist.endAt} already exists`
			);
		}

		return await new SchoolYearModel({}).save();
	} catch (error) {
		throw error;
	}
};
