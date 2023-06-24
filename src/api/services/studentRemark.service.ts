import createHttpError from 'http-errors';
import { ObjectId } from 'mongoose';
import { IStudentRemark } from '../../types/student.type';
import StudentModel from '../models/student.model';
import StudentRemarkModel from '../models/studentRemark.model';
import { validateNewStudentRemark } from '../validations/studentRemark.validation';
import { getCurrentSchoolYear } from './schoolYear.service';

export const createStudentRemark = async (data: Partial<IStudentRemark>, headTeacherId: string | ObjectId) => {
	const currentSchoolYear = await getCurrentSchoolYear();
	const existedRemark = await StudentRemarkModel.findOne({ student: data.student, schoolYear: currentSchoolYear._id });
	if (existedRemark) throw createHttpError.Conflict('Remark for this student in current school year already existed!');
	const student = await StudentModel.findOne({ _id: data.student }).populate({
		path: 'class',
		select: '_id className headTeacher',
		match: { headTeacher: headTeacherId }
	});
	if (!student?.class) throw createHttpError.BadRequest('Only head teacher can remark conduct for this student !');
	const payload = {
		...data,
		schoolYear: currentSchoolYear._id?.toString(),
		remarkedBy: headTeacherId
	} as Omit<IStudentRemark, '_id'>;
	const { error, value } = validateNewStudentRemark(payload);
	if (error) throw createHttpError.BadRequest(error.message);
	const newStudentConduct = await new StudentRemarkModel(value).save();
	return newStudentConduct;
};
