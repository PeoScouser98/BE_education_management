import Joi from 'joi';
import { User } from '../models/user.model';

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

export const validateAccessTokenData = (payload: string) => {
	return Joi.string().validate(payload);
};
