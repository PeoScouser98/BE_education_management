import { IClass } from './../../types/class.type'
import Joi from 'joi'
import { ISubject } from '../../types/subject.type'
import { ISubjectTranscript } from '../../types/subjectTranscription.type'

export const validateSubjectTranscript = (
	data:
		| Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>
		| Array<Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>>,
	subject: ISubject,
	currentClass: IClass
) => {
	let schema = Joi.object({
		student: Joi.string().required(),
		isPassed: Joi.boolean().when('secondSemester', {
			is: Joi.object({
				midtermTest: Joi.number().min(0).max(10),
				finalTest: Joi.number().min(0).max(10).less(5)
			}),
			then: Joi.boolean().default(false),
			otherwise: Joi.boolean().default(true)
		})
	})

	let semesterTranscriptSchema = Joi.object({
		finalTest: Joi.number().min(0).max(10).required()
	})

	if (currentClass.grade > 3) {
		semesterTranscriptSchema = semesterTranscriptSchema.keys({
			midtermTest: Joi.number().min(0).max(10).required()
		})
	}

	/**
	 * Chỉ môn học chính mới có điểm số
	 * Phải có điểm kỳ 1 thì mới có điểm kỳ 2
	 */

	if (subject.isMainSubject) {
		schema = schema.keys({
			firstSemester: semesterTranscriptSchema.required(),
			secondSemester: semesterTranscriptSchema.when('firstSemester', {
				is: Joi.exist(),
				then: Joi.required(),
				otherwise: Joi.forbidden()
			})
		})
	}

	const arraySchema = Joi.array().items(schema)

	return Array.isArray(data) ? arraySchema.validate(data) : schema.validate(data)
}
