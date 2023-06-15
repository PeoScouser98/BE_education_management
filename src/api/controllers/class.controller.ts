import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';
import createHttpError from 'http-errors';
import mongoose, { SortOrder } from 'mongoose';
import { IClass } from '../../types/class.type';
import { HttpException } from '../../types/httpException.type';
import ClassModel from '../models/class.model';
import { HttpStatusCode } from '../../configs/statusCode.config';

// [POST] /api/classes (create classes)
export const createClass = async (req: Request, res: Response) => {
	try {
		const { classes } = await ClassService.createClass(req.body);

		return res.status(HttpStatusCode.CREATED).json(classes);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [PUT] /api/classes/:id (edit classes)
export const updateClass = async (req: Request, res: Response) => {
	try {
		const _id: unknown = req.params.id;
		const data: Partial<Omit<IClass, '_id'>> = req.body;

		const updatedClass = await ClassService.updateClasses(data, _id as string);
		return res.status(HttpStatusCode.CREATED).json(updatedClass);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [DELETE] /api/classes/:id?option= (delete classes)
export const removeClass = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const option = req.query.option || 'soft';
		if (!id) {
			throw createHttpError(HttpStatusCode.NO_CONTENT);
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
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
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

		return res.status(HttpStatusCode.CREATED).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /api/classes?_sort=className&_order=desc
export const getClasses = async (req: Request, res: Response) => {
	try {
		const groupBy = req.query._sort?.toString() || 'grade';
		const order: SortOrder = req.query._order === 'desc' ? 1 : -1;
		const availableSortFields = ['className', 'grade', 'createdAt', 'updatedAt'];

		if (!availableSortFields.includes(groupBy as string)) {
			throw createHttpError.BadRequest("_sort can only belong to ['className', 'grade','createdAt','updatedAt']");
		}

		const classes = await ClassModel.find().sort({
			[groupBy]: order
		});

		return res.status(HttpStatusCode.OK).json(classes);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /api/class/:id
export const getOneClass = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.BadRequest('Missing parameter');
		}

		const classResult = await ClassService.getOneClass(id);

		if (!classResult) {
			throw createHttpError.NotFound('Class not found');
		}

		return res.status(HttpStatusCode.OK).json(classResult);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

// [GET] /api/classes/trash
export const getClassTrash = async (req: Request, res: Response) => {
	try {
		const result = await ClassModel.findWithDeleted({
			deleted: true
		});

		return res.status(HttpStatusCode.OK).json(result);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};
