import createHttpError from 'http-errors';
import UserModel, { User } from '../models/user.model';
import { validateSigninData } from '../validations/user.validation';

/**
 * @param payload (email/phone)
 * @param password
 */

export const authenticateParents = async (phoneNumber: string) => {
	try {
		const user = await UserModel.findOne({
			phone: phoneNumber,
			role: 'PARENTS',
		}).exec();

		if (!user) {
			throw createHttpError.NotFound('Account does not exist!');
		}
		return user as User;
	} catch (error) {
		throw error;
	}
};
