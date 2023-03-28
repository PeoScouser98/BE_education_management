import Joi from 'joi';
import { Subject } from '../models/subject.model';

export const validateSubjectRequestBody = (data: Omit<Subject, '_id'>) => {
	const schema = Joi.object({
		subjectName: Joi.string().required().min(3).max(50),
	});
	return schema.validate(data);
};

export const validateSubjectUpdateBody = (data: Partial<Omit<Subject, '_id'>>) => {
	const schema = Joi.object({
		subjectName: Joi.string().required().min(3).max(50).optional(),
	});
	return schema.validate(data);
};
