import Joi from 'joi';
import { User } from '../models/user.model';

export const emailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/;

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
		displayName: Joi.string().required(),
		dateOfBirth: Joi.date().required(),
		gender: Joi.string().required().valid('nam', 'nữ'),
		phone: Joi.string().required(),
		role: Joi.string().required().valid('TEACHER'),
		eduBackground: Joi.object({
			qualification: Joi.string(),
			universityName: Joi.string().required(),
			graduatedAt: Joi.date().required(),
		}).required(),
	});
	return schema.validate(payload);
};
export const validateAccessTokenData = (payload: string) => {
	return Joi.string().validate(payload);
};
