import ClassModel, { Class } from '../models/class.model';

export const createClass = async (payload: Omit<Class, '_id'>) => {
	try {
		return await new ClassModel(payload).save();
	} catch (error) {
		throw error;
	}
};
