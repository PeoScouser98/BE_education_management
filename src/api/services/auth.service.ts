import createHttpError from 'http-errors';
import UserModel, { User } from '../models/user.model';
import { validateSigninData } from '../validations/user.validation';

/**
 * @param payload (email/phone)
 * @param password
 */

export const authenticateUser = async (payload: string) => {
	try {
		const user = await UserModel.findOne({
			$or: [
				{
					phone: payload,
				},
				{
					email: payload,
				},
			],
		}).exec();

		if (!user) {
			throw createHttpError.NotFound('Account does not exist!');
		}

		return user;
	} catch (error) {
		throw error;
	}
};
