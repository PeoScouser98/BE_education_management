import TeacherModel, { Teacher } from '../models/teacher.model';

export const createNewTeacher = async (payload: Omit<Teacher, '_id' | 'employmentStatus'>) => {
	try {
		return await new TeacherModel(payload).save();
	} catch (error) {
		throw error;
	}
};
