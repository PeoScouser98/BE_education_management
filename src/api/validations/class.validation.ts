import Joi from 'joi';
import { Class } from '../models/class.model';

export const validateClassData = (data: Omit<Class, '_id'>) => {
	const schema = Joi.object({
		className: Joi.string().required(),
		headTeacher: Joi.string().required(),
		grade: Joi.number().required().valid(1, 2, 3, 4, 5),
	});
	return schema.validate(data);
};
