import schoolYearModel from '../models/schoolYear.model';
import {SchoolYear} from '../interfaces/schemas.interface';

export const getAll = async (limit: number, currPage: number) => {
    const schoolYears = await schoolYearModel
        .find()
        .limit(limit)
        .skip(limit * currPage - limit)
        .exec();

    const countDocumentSchoolYear = await schoolYearModel.countDocuments();
    return {
        schoolYears,
        pages: Math.ceil(countDocumentSchoolYear / limit),
    };
};

export const create = async (data: SchoolYear) => {
    const newSchoolYear = new schoolYearModel(data);
    await newSchoolYear.save();
    return newSchoolYear;
};

export const update = async (data: SchoolYear, schoolYearId: string) =>
    await schoolYearModel.findByIdAndUpdate(schoolYearId, data, {new: true});

export const remove = async (schoolYearId: string) =>
    await schoolYearModel.findByIdAndDelete(schoolYearId);
