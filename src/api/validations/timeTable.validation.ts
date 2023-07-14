import Joi from 'joi'
import { ITimeTable } from '../../types/timeTable.type'

const timeSlotSchema = Joi.object({
	class: Joi.string().required(),
	period: Joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7, 8).required(),
	subject: Joi.string().required(),
	teacher: Joi.string().required()
})

export const validateTimeTableData = (payload: Omit<ITimeTable, '_id'>) => {
	return Joi.object({
		monday: Joi.array().unique('period').items(timeSlotSchema).required(),
		tuesday: Joi.array().unique('period').items(timeSlotSchema).required(),
		wednesday: Joi.array().unique('period').items(timeSlotSchema).required(),
		thursday: Joi.array().unique('period').items(timeSlotSchema).required(),
		friday: Joi.array().unique('period').items(timeSlotSchema).required()
	}).validate(payload)
}
