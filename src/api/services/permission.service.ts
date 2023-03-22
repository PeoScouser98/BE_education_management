import { MongooseError } from 'mongoose';
import PermissionModel, { Permission } from '../models/permission.model';

export const createPermission = async (permission: Permission & Partial<Permission>) => {
	try {
		return await new PermissionModel(permission).save();
	} catch (error) {
		throw error as MongooseError;
	}
};

export const getPermissions = async () => {
	try {
		return await PermissionModel.find().exec();
	} catch (error) {
		throw error as MongooseError;
	}
};

export const getPermissionByRole = async (role: string) => {
	try {
		return await PermissionModel.findOne({ role: role }).exec();
	} catch (error) {
		throw error as MongooseError;
	}
};

export const deletePermission = async (permissionID: string) => {
	try {
		return await PermissionModel.findOneAndDelete({ _id: permissionID }).exec();
	} catch (error) {
		throw error as MongooseError;
	}
};

export const updatePermission = async (
	permissionID: string,
	permission: Permission & Partial<Permission>
) => {
	try {
		return await PermissionModel.findOneAndUpdate({ _id: permissionID }, permission, {
			new: true,
		}).exec();
	} catch (error) {
		throw error as MongooseError;
	}
};
