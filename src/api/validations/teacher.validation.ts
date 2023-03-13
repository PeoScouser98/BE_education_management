import Joi from 'joi';
import { Teacher } from '../models/teacher.model';

export const validateTeacher = (payload: Teacher) => {
	return Joi.object({
		userId: Joi.string().required(),
		eduBackground: Joi.string().uppercase().required(),
		employmentStatus: Joi.boolean(),
	}).validate(payload);
};
