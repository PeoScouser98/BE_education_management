import { IUser } from '../../types/user.type';
import UserModel from '../models/user.model';

export const createUser = async (payload: Partial<IUser>) => {
	try {
		return await new UserModel(payload).save();
	} catch (error) {
		console.log(error);
		throw error;
	}
};

export const updateUserInfo = async (authId: string, payload: Partial<IUser>) => {
	try {
		return await UserModel.findOneAndUpdate({ _id: authId }, payload, { new: true });
	} catch (error) {
		throw error;
	}
};
