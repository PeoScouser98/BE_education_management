import HeadmasterModel, { Headmaster } from '../models/headmaster.model';

export const authenticateAdmin = async (payload: Pick<Headmaster, 'email' | 'password'>) => {
	try {
		const adminInfo = await HeadmasterModel.findOne({ email: payload.email }).exec();
		if (!adminInfo) throw new Error("Account doesn't exist!");
		if (!adminInfo.authenticate(payload.password)) throw new Error('Incorrect password!');
		return adminInfo;
	} catch (error) {
		throw error as Error;
	}
};

export const createAndAuthorizeForNewAdmin = async (payload: Headmaster) => {
	try {
		return await new HeadmasterModel(payload).save();
	} catch (error) {
		throw error as Error;
	}
};
