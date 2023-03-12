import createHttpError from 'http-errors';
import UserModel, { User } from '../models/user.model';
import { validateSigninData } from '../validations/user.validation';

/**
 * @param payload (email/phone)
 * @param password
 */

export const authenticateUserService = async (payload: Pick<User, 'phone' | 'password'>) => {
	try {
		const { error } = validateSigninData(payload);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}
		const user = await UserModel.findOne({ phone: payload.phone });
		if (!user) {
			throw createHttpError.NotFound('Account does not exist!');
		}
		if (!user.authenticate(payload.password)) {
			throw createHttpError.BadRequest('Incorrect password!');
		}

		return user;
	} catch (error) {
		throw error;
	}
};

export const createUser = async (payload: User) => {
	try {
		return await new UserModel(payload).save();
	} catch (error) {
		throw error;
	}
};
