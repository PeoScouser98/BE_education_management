import HeadmasterModel, { Headmaster } from '../models/headmaster.model';

export const authenticateHeadmaster = async (payload: Pick<Headmaster, 'email' | 'password'>) => {
	try {
		const headmasterInfo = await HeadmasterModel.findOne({ email: payload.email }).exec();
		if (!headmasterInfo) throw new Error("Account doesn't exist!");
		if (!headmasterInfo.authenticate(payload.password)) throw new Error('Incorrect password!');
		console.log(headmasterInfo);
		return headmasterInfo;
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
