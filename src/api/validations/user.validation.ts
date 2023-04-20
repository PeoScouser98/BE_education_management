import Joi from 'joi';
import { IUser } from '../../types/user.type';

export const emailRegex = /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/g;

export const validateSigninData = (payload: Pick<IUser, 'phone' & 'password'>) => {
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

export const validateNewTeacherData = (payload: Omit<IUser, '_id'>) => {
	const schema = Joi.object({
		email: Joi.string().email().pattern(emailRegex).required(),
		password: Joi.string().min(6).max(24),
		displayName: Joi.string().required(),
		dateOfBirth: Joi.date().required(),
		gender: Joi.string().required().valid('nam', 'nữ'),
		eduBackground: Joi.object({
			universityName: Joi.string().required(),
			graduatedAt: Joi.date().required(),
			qualification: Joi.string(),
		}),
	});
	return schema.validate(payload);
};

export const validateNewParentsData = (payload: Omit<IUser, '_id'>) => {
	const schema = Joi.object({
		phone: Joi.string().length(10).required(),
		displayName: Joi.string().required(),
		dateOfBirth: Joi.date().required(),
		gender: Joi.string().required(),
	});
	return schema.validate(payload);
};

export const validateUpdateUserData = (payload: Partial<IUser>) => {
	const schema = Joi.object({
		displayName: Joi.string().optional(),
		dateOfBirth: Joi.date().optional(),
		gender: Joi.string().optional(),
		picture: Joi.string().optional(),
		eduBackground: Joi.object({
			universityName: Joi.string().required(),
			graduatedAt: Joi.date().required(),
			qualification: Joi.string().required(),
		}).optional(),
	});
	return schema.validate(payload);
};
