import Joi from 'joi';
import { IAttendance, Student } from '../models/student.model';

// validate
export const validateReqBodyStudent = (data: Omit<Student, '_id'>) => {
	const schema = Joi.object({
		class: Joi.string().required(),
		fullName: Joi.string().required().min(6).max(100),
		gender: Joi.bool().required(),
		dateOfBirth: Joi.date().required(),
		parentsPhoneNumber: Joi.string()
			.required()
			.pattern(/^(?:\+84|0)(?:1\d{9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/),
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

export const validateUpdateReqBodyStudent = (data: Partial<Omit<Student, '_id'>>) => {
	const schema = Joi.object({
		class: Joi.string().required().optional(),
		fullName: Joi.string().required().min(6).max(100).optional(),
		gender: Joi.bool().required().optional(),
		dateOfBirth: Joi.date().required().optional(),
		parentsPhoneNumber: Joi.string()
			.required()
			.optional()
			.pattern(/^(?:\+84|0)(?:1\d{9}|3\d{8}|5\d{8}|7\d{8}|8\d{8}|9\d{8})$/),
		isPolicyBeneficiary: Joi.bool().optional(),
		isGraduated: Joi.bool().optional(),
	});
	return schema.validate(data);
};
