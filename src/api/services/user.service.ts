import UserModel, { User } from '../models/user.model';

export const createUser = async (payload: Partial<User>) => {
	try {
		return await new UserModel(payload).save();
	} catch (error) {
		throw error;
	}
};
