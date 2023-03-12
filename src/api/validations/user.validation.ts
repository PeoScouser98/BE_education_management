import Joi from 'joi';
import { User } from '../models/user.model';
export const emailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/g;

export const validateSigninData = (payload: Pick<User, 'phone' & 'password'>) => {
	const schema = Joi.object({
		phone: Joi.alternatives()
			.try(
				Joi.string()
					.lowercase()
					.email({
						minDomainSegments: 2,
						tlds: {
							allow: ['com'],
						},
					}),
				Joi.string().alphanum().min(3).max(30)
			)
			.required()
			.error(new Error('Invalid email or userName')),

		password: Joi.string().min(6).max(32).required(),
	});
	return schema.validate(payload);
};

export const validateTeacherAccount = (payload: Omit<User, '_id'>) => {
	const schema = Joi.object({
		email: Joi.string().email().pattern(emailRegex).required(),
		password: Joi.string().min(6).max(24),
		username: Joi.string().required(),
		dateOfBirth: Joi.date().required(),
		gender: Joi.string().required().valid('nam', 'nữ'),
		eduBackground: Joi.string().required().valid('TRUNG CẤP', 'CAO ĐẲNG', 'ĐẠI HỌC', 'CAO HỌC'),
	});
	return schema.validate(payload);
};
