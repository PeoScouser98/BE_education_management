import createHttpError from 'http-errors';
import UserModel from '../models/user.model';

export const createAndAuthorizeForNewAdmin = async (payload: any) => {
	try {
		return await new UserModel(payload).save();
	} catch (error) {
		throw error as Error;
	}
};
