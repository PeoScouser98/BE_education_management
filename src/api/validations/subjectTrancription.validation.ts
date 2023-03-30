import Joi from 'joi';
import { SubjectTranscript } from '../models/subjectTrancription.model';

export const validateSubjectTranscript = (
	data: Omit<SubjectTranscript, '_id' | 'subject' | 'schoolYear'>
) => {
	const schema = Joi.object({
		student: Joi.string().required(),
		firstSemester: Joi.object({
			midtermTest: Joi.number().required().min(0).max(10),
			finalTest: Joi.number().required().min(0).max(10),
		}).optional(),
		secondSemester: Joi.object({
			midtermTest: Joi.number().required().min(0).max(10),
			finalTest: Joi.number().required().min(0).max(10),
		}).optional(),
	});
	return schema.validate(data);
};
