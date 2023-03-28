import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import * as PermService from '../services/permission.service';
import { validatePermissionData } from '../validations/permission.validation';
import { isValidObjectId } from 'mongoose';

//* [POST] /api/permissions (get permissions)
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

//* [GET] /api/permission?role="Role" (get permissions by role)
export const read = async (req: Request, res: Response) => {
	const availableRoles = ['ADMIN', 'HEADMASTER', 'TEACHER', 'PARENTS'];

	try {
		const role = req.query.role as string;

		if (!role) throw createHttpError.BadRequest('Missing parameter: role');
		if (!availableRoles.includes(role))
			throw createHttpError.BadRequest(
				`User's role parameter must be one of these: ${availableRoles}`
			);

		const permissions = await PermService.getPermissionByRole(role);

		if (!permissions) throw createHttpError.NotFound('Permission not found');

		return res.status(200).json(permissions);
	} catch (error) {
		console.log(error);
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			status: (error as HttpError).status || 500,
		});
	}
};

//* [POST] /api/permission (create permission)
export const create = async (req: Request, res: Response) => {
	try {
		const data = req.body;
		const { error } = validatePermissionData(data);

		if (error) throw createHttpError.BadRequest(error.message);
		if (!data) throw createHttpError.BadRequest('Missing data in request body');

		const newPermission = await PermService.createPermission(data);

		if (!newPermission) throw createHttpError.BadRequest('Permission not created!');

		return res.status(201).json(newPermission);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

//* [DELETE] /api/permission/:id?option='Option' (delete permission)
export const remove = async (req: Request, res: Response) => {
	let result

	try {
		const { id } = req.params;
		const option = req.query.option || 'soft'; //default option is soft

		if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID!');

		switch (option) {
			case 'soft':
				result = await PermService.softDeletePermission(id);
				break;
			case 'force':
				result = await PermService.forceDeletePermission(id);
				break;
			default:
				throw createHttpError.BadRequest('Invalid query');
		}

		return res.status(result.statusCode).json(result);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

//* [PUT] /api/permisison/restore/:id (restore permission)
export const restore = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;

		if (!id || !isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID!');

		const result = await PermService.restoreDeletedPermission(id);

		if (!result) throw createHttpError.NotFound('Permission not found');

		return res.status(201).json(result);
	} catch (error) {
		return res.status((error as HttpError).statusCode || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};

///* [PUT] /api/permission/:id (update permission)
export const update = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const data = req.body;
		const { error } = validatePermissionData(data);

		if (error) throw createHttpError.BadRequest(error.message);
		if (!id) throw createHttpError.BadRequest('Missing ID parameter');
		if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid ID');
		if (!data) throw createHttpError.BadRequest('Missing data in request body');

		const updatedPermission = await PermService.updatePermission(id, data);

		if (!updatedPermission) throw createHttpError.NotFound('Permission not found');

		return res.status(200).json(updatedPermission);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError | Error).message,
			statusCode: (error as HttpError).status || 500,
		});
	}
};
