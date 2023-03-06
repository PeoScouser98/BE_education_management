import TeacherModel, { Teacher } from '../models/teacher.model';

export const createTeacherAccount = async (payload: Teacher) => {
	try {
		const existedTeacher = await TeacherModel.findOne({
			email: payload.email,
		}).exec();
		if (existedTeacher) throw new Error('Teacher already existed!');
		return await new TeacherModel(payload).save();
	} catch (error) {
		throw error as Error;
	}
};

export const authenticateTeacher = async (payload: Pick<Teacher, 'email' | 'password'>) => {
	try {
		const existedTeacher = (await TeacherModel.findOne({
			email: payload.email,
		})) as Teacher;
		if (!existedTeacher) throw new Error('Teacher account does not exist!');
		if (!existedTeacher.authenticate(payload.password)) throw new Error('Password is incorrect!');
		return existedTeacher;
	} catch (error) {
		throw error as Error;
	}
};
