import { IUser } from '../../types/user.type';
import UserModel from '../models/user.model';
import bcrypt, { genSaltSync, hashSync } from 'bcrypt';

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

export const changePassword = async (userId: string, newPassword: string) => {
	try {
		const encryptedNewPassword = hashSync(newPassword, genSaltSync(+process.env.SALT_ROUND!));
		return await UserModel.findOneAndUpdate(
			{ _id: userId },
			{ password: encryptedNewPassword },
			{ new: true }
		);
	} catch (error) {
		throw error;
	}
};
