import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';

// class feature
import createHttpError, { isHttpError } from 'http-errors';
import ClassModel, { Class } from '../models/class.model';
import mongoose from 'mongoose';

// [POST] /api/classes (create classes)
export const createClass = async (req: Request, res: Response) => {
	try {
		const { classes } = await ClassService.createClass(req.body);

		return res.status(200).json(classes);
	} catch (error) {
		if (isHttpError(error)) {
			return res.status(error.status).json({
				message: error.message,
				statusCode: error.status,
				errorData: 'errorData' in error ? error.errorData : undefined,
			});
		}
		return res.json(error);
	}
};

// [PUT] /api/classes/:_id (edit classes)
export const updateClass = async (req: Request, res: Response) => {
	try {
		const _id: unknown = req.params._id;
		const data: Partial<Omit<Class, '_id'>> = req.body;

		const { newClasses } = await ClassService.updateClasses(data, _id as string);

		return res.status(200).json({
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

// [DELETE] /api/classes/_id?option= (delete classes)
export const removeClass = async (req: Request, res: Response) => {
	try {
		const id = req.params._id;
		const option = req.query.option || 'soft';
		if (!id) {
			throw createHttpError(204);
		}
		let result;

		switch (option) {
			case 'soft':
				result = await ClassService.softDeleteClass(id);
				break;

			case 'restore':
				result = await ClassService.restoreClass(id);
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

// [GET] /api/classes?limit=10&page=1&sortProperties=className&sort=desc
export const getClasses = async (req: Request, res: Response) => {
	try {
		const { limit = 10, page } = req.query;
		const sortProperties: any = req.query.sortProperties || 'grade';
		const sort: any = req.query.sort || 'asc';
		if (!page) {
			throw createHttpError.BadRequest('Missing parameter');
		}

		if (!['className', 'grade', 'createdAt', 'updatedAt'].includes(sortProperties)) {
			throw createHttpError.BadGateway(
				"sortProperties can only belong to ['className', 'grade','createdAt','updatedAt']"
			);
		}

		let start = Number(page) === 1 ? 0 : Number(limit) * Number(page) - Number(limit);

		const result = await ClassModel.find({})
			.sort({ [sortProperties]: sort })
			.skip(start)
			.limit(Number(limit));

		return res.status(200).json({
			classes: result,
			page: Number(page),
			sort: [sortProperties, sort],
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

// [GET] /api/class/:_id
export const getClassOne = async (req: Request, res: Response) => {
	try {
		const id = req.params._id;
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
