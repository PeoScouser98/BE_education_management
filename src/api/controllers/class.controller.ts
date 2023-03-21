import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';

// class feature
import createHttpError, { isHttpError } from 'http-errors';
import mongoose, { SortOrder } from 'mongoose';
import ClassModel, { Class } from '../models/class.model';

// Todo: Update lại toàn bộ status response

// [POST] /api/classes (create classes)
export const createClass = async (req: Request, res: Response) => {
	try {
		const { classes } = await ClassService.createClass(req.body);

		return res.status(201).json(classes);
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.status).json({
				message: error.message,
				statusCode: error.status,
			});
		}
		return res.status(500).json(error);
	}
};

// [PUT] /api/classes/:id (edit classes)
export const updateClass = async (req: Request, res: Response) => {
	try {
		const _id: unknown = req.params.id;
		const data: Partial<Omit<Class, '_id'>> = req.body;

		const { newClasses } = await ClassService.updateClasses(data, _id as string);
		return res.status(201).json({
			classe: newClasses,
			message: 'Class update successful',
		});
	} catch (error) {
		if ((error as any)?.code === 11000) {
			return res.status(500).json({
				statusCode: 11000,
				message: `Class name ${(error as any).keyValue?.className} already exists`,
			});
		} else if (isHttpError(error)) {
			return res.status(error.status).json({
				message: error.message,
				statusCode: error.status,
			});
		}
	}
};

// [DELETE] /api/classes/:id?option= (delete classes)
export const removeClass = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const option = req.query.option || 'soft';
		if (!id) {
			throw createHttpError(204);
		}
		let result;

		switch (option) {
			case 'soft':
				result = await ClassService.softDeleteClass(id);
				break;
			case 'force':
				result = await ClassService.forceDeleteClass(id);
				break;

			default:
				throw createHttpError.InternalServerError('InternalServerError');
		}

		return res.status(result.statusCode).json(result);
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.statusCode).json({
				message: error.message,
				statusCode: error.status,
			});
		} else {
			return res.status(500).json(error);
		}
	}
};

// [PUT] /api/class/restore/:id
export const restoreClass = async (req: Request, res: Response) => {
	try {
		const id: string = req.params.id;

		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.BadRequest('id must type must be object id, id received:' + id);
		}

		const result = await ClassService.restoreClass(id);

		return res.status(201).json(result);
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.statusCode).json({
				message: error.message,
				statusCode: error.status,
			});
		} else {
			return res.status(500).json(error);
		}
	}
};

// [GET] /api/classes?_sort=className&_order=desc
export const getClasses = async (req: Request, res: Response) => {
	try {
		const groupBy = req.query._sort?.toString() || 'grade';
		const order: SortOrder = req.query._order === 'desc' ? 1 : -1;
		const availableSortFields = ['className', 'grade', 'createdAt', 'updatedAt'];

		if (!availableSortFields.includes(groupBy as string)) {
			throw createHttpError.BadRequest(
				"_sort can only belong to ['className', 'grade','createdAt','updatedAt']"
			);
		}

		const result = await ClassModel.find().sort({
			[groupBy]: order,
		});

		return res.status(200).json({
			classes: result,
			sort: [groupBy, order],
		});
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.statusCode).json({
				message: error.message,
				statusCode: error.status,
			});
		} else {
			return res.status(500).json(error);
		}
	}
};

// [GET] /api/class/:id
export const getClassOne = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.BadRequest('Missing parameter');
		}

		const classResult = await ClassModel.findOne({ _id: id });

		if (!classResult) {
			throw createHttpError.NotFound('Class not found');
		}

		return res.status(200).json(classResult);
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.statusCode).json({
				message: error.message,
				statusCode: error.status,
			});
		} else {
			return res.status(500).json(error);
		}
	}
};

// [GET] /api/classes/trash
export const getClassTrash = async (req: Request, res: Response) => {
	try {
		const result = await ClassModel.findWithDeleted({
			deleted: true,
		});

		return res.status(200).json(result);
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.statusCode).json({
				message: error.message,
				statusCode: error.status,
			});
		} else {
			return res.status(500).json(error);
		}
	}
};
