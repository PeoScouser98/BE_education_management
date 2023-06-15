import Joi from 'joi';
import { ISubject } from '../../types/subject.type';

export const validateSubjectRequestBody = (data: Omit<ISubject, '_id'>) => {
	const schema = Joi.object({
		subjectName: Joi.string().required().min(3).max(50)
	});
	return schema.validate(data);
};

export const validateSubjectUpdateBody = (data: Partial<Omit<ISubject, '_id'>>) => {
	const schema = Joi.object({
		subjectName: Joi.string().required().min(3).max(50).optional()
	});
	return schema.validate(data);
};
