import Joi from 'joi';
import { ITimeTable } from '../../types/timeTable.type';

const timeSlotSchema = Joi.object({
	period: Joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).required(),
	subject: Joi.string().required(),
	teacher: Joi.string().required(),
});

export const validateNewTimeTable = (payload: Omit<ITimeTable, '_id'>) => {
	return Joi.object({
		class: Joi.string().required(),
		schedule: Joi.object({
			monday: Joi.array().unique('period').items(timeSlotSchema).required(),
			tuesday: Joi.array().unique('period').items(timeSlotSchema).required(),
			wednesday: Joi.array().unique('period').items(timeSlotSchema).required(),
			thursday: Joi.array().unique('period').items(timeSlotSchema).required(),
			friday: Joi.array().unique('period').items(timeSlotSchema).required(),
			saturday: Joi.array().unique('period').items(timeSlotSchema).required(),
		}).required(),
	}).validate(payload);
};

export const validateUpdateTimeTablePayload = (payload: Partial<ITimeTable>) => {
	return Joi.object({
		class: Joi.string(),
		schedule: Joi.object({
			monday: Joi.array().unique('period').items(timeSlotSchema).required(),
			tuesday: Joi.array().unique('period').items(timeSlotSchema).required(),
			wednesday: Joi.array().unique('period').items(timeSlotSchema).required(),
			thursday: Joi.array().unique('period').items(timeSlotSchema).required(),
			friday: Joi.array().unique('period').items(timeSlotSchema).required(),
			saturday: Joi.array().unique('period').items(timeSlotSchema).required(),
		}).required(),
	}).validate(payload);
};
