import { genSaltSync, hashSync } from 'bcrypt';
import createHttpError from 'http-errors';
import removeVietnameseTones from '../../helpers/vnFullTextSearch';
import { IUser } from '../../types/user.type';
import UserModel from '../models/user.model';
import { UserRoleEnum } from './../../types/user.type';

export const createUser = async (payload: Partial<IUser> & Array<Partial<IUser>>) => {
	if (Array.isArray(payload) && payload.every((user) => user.role === UserRoleEnum.PARENTS)) {
		const hasExistedUser = await UserModel.exists({ email: { $in: payload.map((user) => user.email) } });
		if (hasExistedUser) throw createHttpError.Conflict('Parent account already existed!');
		return await UserModel.insertMany(payload);
	}
	// Add a new teacher user
	if (payload.role === UserRoleEnum.TEACHER) {
		const existedTeacher = await UserModel.findOne({
			email: payload.email,
			role: UserRoleEnum.TEACHER
		});
		if (existedTeacher) {
			throw createHttpError.BadRequest('Teacher account already existed!');
		}

		return await new UserModel(payload).save();
	}
};

// Users update them self account's info
export const updateUserInfo = async (authId: string, payload: Partial<IUser>) => {
	return await UserModel.findOneAndUpdate({ _id: authId }, payload, {
		new: true
	});
};

// Headmaster update teacher user's info
export const updateTeacherInfo = async (teacherId: string, payload: Partial<IUser>) => {
	return await UserModel.findOneAndUpdate({ _id: teacherId, role: UserRoleEnum.TEACHER }, payload, { new: true });
};

export const getUserDetails = async (userId: string) => await UserModel.findOne({ _id: userId }).lean();

export const changePassword = async (userId: string, newPassword: string) => {
	const encryptedNewPassword = hashSync(newPassword, genSaltSync(+process.env.SALT_ROUND!));

	return await UserModel.findOneAndUpdate({ _id: userId }, { password: encryptedNewPassword }, { new: true });
};

export const getTeacherUsersByStatus = async (status?: string) => {
	switch (status) {
		case 'inactive':
			return await UserModel.find({
				role: UserRoleEnum.TEACHER,
				isVerified: false
			});

		// In working teacher
		case 'in_working':
			return await UserModel.find({
				role: UserRoleEnum.TEACHER,
				employmentStatus: true
			});

		// Inactivate user
		case 'quited':
			return await UserModel.findWithDeleted({
				role: UserRoleEnum.TEACHER,
				deleted: true,
				isVerified: true,
				employmentStatus: false
			});

		default:
			return await UserModel.findWithDeleted({
				role: UserRoleEnum.TEACHER
			});
	}
};

export const deactivateTeacherUser = async (userId: string) => {
	return await UserModel.findOneAndUpdate(
		{ _id: userId, role: UserRoleEnum.TEACHER },
		{ employmentStatus: false, deleted: true },
		{ new: true }
	).lean();
};

export const getParentsUserByClass = async (classId: string) => {
	const parents = await UserModel.find({ role: UserRoleEnum.PARENTS })
		.populate({
			path: 'children',
			select: 'fullName class -parents',
			match: { class: classId },
			populate: { path: 'class', select: 'className' }
		})
		.lean()
		.transform((documents) => documents.filter((doc) => doc.children.length > 0));

	return parents;
};

export const searchParents = async (searchTerm: string) => {
	// searchTerm = removeVietnameseTones(searchTerm);
	const pattern = new RegExp(`^${searchTerm}`, 'gi');

	return await UserModel.find({
		$or: [
			{ phone: pattern, role: UserRoleEnum.PARENTS },
			{
				displayName: removeVietnameseTones(searchTerm),
				role: UserRoleEnum.PARENTS
			},
			{ email: pattern, role: UserRoleEnum.PARENTS }
		]
	}).lean();
};
