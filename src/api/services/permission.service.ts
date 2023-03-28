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

export const softDeletePermission = async (permissionID: string) => {
	try {
		await PermissionModel.delete({ _id: permissionID })

		return {
			message: 'The permission has been successfully moved to the trash',
			statusCode: 200,
		};
	} catch (error) {
		throw error as MongooseError;
	}
};

export const forceDeletePermission = async (permissionID: string) => {
	try {
		await PermissionModel.deleteOne({ _id: permissionID })

		return {
			message: 'The permission has been successfully deleted permanently',
			statusCode: 200,
		}
	} catch (error) {
		throw error as MongooseError;
	}
};

export const restoreDeletedPermission = async (permissionID: string) => {
	try {
		await PermissionModel.restore({ _id: permissionID });

		return {
			message: 'The permission has been successfully restored',
			statusCode: 200,
		}
	}
	catch (error) {
		throw error as MongooseError;
	}
}

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