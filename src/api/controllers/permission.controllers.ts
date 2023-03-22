import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import * as PermService from '../services/permission.service';
import { validatePermissionData } from '../validations/permission.validation';
import { isValidObjectId } from 'mongoose';

export const list = async (req: Request, res: Response) => {
	try {
		const permissions = await PermService.getPermissions();

		if (!permissions) throw createHttpError.NotFound('Cannot get permissions!');

		return res.status(200).json(permissions);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};

export const read = async (req: Request, res: Response) => {
	const availableRoles = ['ADMIN', 'HEADMASTER', 'TEACHER', 'PARENTS'];

	try {
		const role = req.query.role as string;
		const permissions = await PermService.getPermissionByRole(role);

		if (!role) throw createHttpError.BadRequest('Missing params!');
		if (!availableRoles.includes(role))
			throw createHttpError.BadRequest(
				`User's role params must be one of these: ${availableRoles}`
			);
		if (!permissions) throw createHttpError.NotFound('Cannot get permissions!');

		return res.status(200).json(permissions);
	} catch (error) {
		console.log(error);
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};

export const create = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		console.log(req.body);
		const { error } = validatePermissionData(data);
		if (error) throw createHttpError.BadRequest(error.message);

		const newPermission = await PermService.createPermission(data);

		if (!data) throw createHttpError.BadRequest('No data provided!');
		if (!newPermission) throw createHttpError.BadRequest('Cannot create new subject!');

		return res.status(201).json(newPermission);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const remove = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const newPermission = await PermService.deletePermission(id);

		if (!newPermission) throw createHttpError.BadRequest('Cannot delete subject!');
		if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID!');

		return res.status(200).json(newPermission);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

export const update = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const data = req.body;

		const { error } = validatePermissionData(data);
		if (error) throw createHttpError.BadRequest(error.message);

		const newPermission = await PermService.updatePermission(id, data);

		if (!id) throw createHttpError.BadRequest('No ID provided!');
		if (!data) throw createHttpError.BadRequest('No data provided!');
		if (!newPermission) throw createHttpError.BadRequest('Cannot update subject!');
		if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID!');

		return res.status(200).json(newPermission);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
