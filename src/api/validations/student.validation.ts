import Joi from 'joi';
import { IAttendance, Student } from '../models/student.model';

// validate
export const validateReqBodyStudent = (data: Omit<Student, '_id'>) => {
	const schema = Joi.object({
		class: Joi.string().required(),
		fullName: Joi.string().required().min(6).max(100),
		gender: Joi.bool().required(),
		dateOfBirth: Joi.date().required(),
		parentsPhoneNumber: Joi.string().required(),
		isPolicyBeneficiary: Joi.bool().optional(),
		isGraduated: Joi.bool().optional(),
	});
	return schema.validate(data);
};

export const validateAttendanceStudent = (data: Omit<IAttendance, '_id' | 'date'>) => {
	const schema = Joi.object({
		hasPermision: Joi.bool().optional(),
		reason: Joi.string().min(8).max(256).optional(),
	});

	return schema.validate(data);
};
