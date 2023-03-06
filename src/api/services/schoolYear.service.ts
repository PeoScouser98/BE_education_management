import SchoolYearModel, { SchoolYear } from '../models/schoolYear.model';

export const getAll = async (limit: number, currPage: number) => {
	const schoolYears = await SchoolYearModel.find()
		.limit(limit)
		.skip(limit * currPage - limit)
		.exec();

	const countDocumentSchoolYear = await SchoolYearModel.countDocuments();
	return {
		schoolYears,
		pages: Math.ceil(countDocumentSchoolYear / limit),
	};
};

export const create = async (data: SchoolYear) => {
	const newSchoolYear = new SchoolYearModel(data);
	await newSchoolYear.save();
	return newSchoolYear;
};

export const update = async (data: SchoolYear, schoolYearId: string) => await SchoolYearModel.findByIdAndUpdate(schoolYearId, data, { new: true });

export const remove = async (schoolYearId: string) => await SchoolYearModel.findByIdAndDelete(schoolYearId);
