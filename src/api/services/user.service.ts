import UserModel, { User } from '../models/user.model';

export const createUser = async (payload: Partial<User>) => {
	try {
		return await new UserModel(payload).save();
	} catch (error) {
		throw error;
	}
};

export const updateUserInfo = async (authId: string, payload: Partial<User>) => {
	try {
		return await UserModel.findOneAndUpdate({ _id: authId }, payload, { new: true });
	} catch (error) {
		throw error;
	}
};
