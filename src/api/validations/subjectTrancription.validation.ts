import Joi from 'joi';
import { ISubjectTranscript } from '../../types/subjectTranscription.type';

export const validateSubjectTranscript = (
	data:
		| Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>
		| Array<Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>>
) => {
	const schema = Joi.object({
		student: Joi.string().required(),
		firstSemester: Joi.object({
			midtermTest: Joi.number().required().min(0).max(10),
			finalTest: Joi.number().required().min(0).max(10)
		}).optional(),
		secondSemester: Joi.object({
			midtermTest: Joi.number().required().min(0).max(10),
			finalTest: Joi.number().required().min(0).max(10)
		}).optional()
	});
	const arraySchema = Joi.array().items(schema);
	return Array.isArray(data) ? arraySchema.validate(data) : schema.validate(data);
};

export const validateSubjectTranscriptOne = (
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear' | 'student'>
) => {
	const schema = Joi.object({
		firstSemester: Joi.object({
			midtermTest: Joi.number().required().min(0).max(10),
			finalTest: Joi.number().required().min(0).max(10)
		}).optional(),
		secondSemester: Joi.object({
			midtermTest: Joi.number().required().min(0).max(10),
			finalTest: Joi.number().required().min(0).max(10)
		}).optional()
	});
	return schema.validate(data);
};
