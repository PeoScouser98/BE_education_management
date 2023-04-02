import Joi from 'joi';
import { IPermissionsType } from '../../types/permission.type';

enum Role {
	ADMIN = 'ADMIN',
	HEADMASTER = 'HEADMASTER',
	TEACHER = 'TEACHER',
	PARENTS = 'PARENTS',
}

export const validatePermissionData = (data: Omit<IPermissionsType, '_id'>) => {
	const schema = Joi.object({
		role: Joi.string()
			.valid(...Object.values(Role))
			.required(),
		type: Joi.string().required(),
		permissions: Joi.array()
			.items({
				_id: Joi.string().strip(),
				name: Joi.string().required(),
				code: Joi.string().required(),
			})
			.optional(),
	});
	return schema.validate(data);
};
