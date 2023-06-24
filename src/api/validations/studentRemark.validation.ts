import Joi from 'joi';
import { IStudentRemark, StudentQualityEnum } from '../../types/student.type';

export const validateNewStudentRemark = (payload: Omit<IStudentRemark, '_id'>) => {
	const schema = Joi.object({
		student: Joi.string().required(),
		schoolYear: Joi.string().required(),
		conduct: Joi.string()
			.valid(...Object.values(StudentQualityEnum))
			.required(),
		proficiency: Joi.string()
			.valid(...Object.values(StudentQualityEnum))
			.required(),
		remark: Joi.string().required(),
		remarkedBy: Joi.string().required()
	});

	return schema.validate(payload);
};
