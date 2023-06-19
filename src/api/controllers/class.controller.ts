import { Request, Response } from 'express';
import * as ClassService from '../services/class.service';
import createHttpError from 'http-errors';
import mongoose, { SortOrder } from 'mongoose';
import { IClass } from '../../types/class.type';
import ClassModel from '../models/class.model';
import { HttpStatusCode } from '../../configs/statusCode.config';
import useCatchAsync from '../../helpers/useCatchAsync';

// [POST] /api/classes (create classes)
export const createClass = useCatchAsync(async (req: Request, res: Response) => {
	const { classes } = await ClassService.createClass(req.body);

	return res.status(HttpStatusCode.CREATED).json(classes);
});

// [PUT] /api/classes/:id (edit classes)
export const updateClass = useCatchAsync(async (req: Request, res: Response) => {
	const _id: unknown = req.params.id;
	const data: Partial<Omit<IClass, '_id'>> = req.body;

	const updatedClass = await ClassService.updateClasses(data, _id as string);
	return res.status(HttpStatusCode.CREATED).json(updatedClass);
});

// [DELETE] /api/classes/:id?option= (delete classes)
export const removeClass = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	const option = req.query.option || 'soft';

	if (!id) throw createHttpError(HttpStatusCode.NO_CONTENT);

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
});

// [PUT] /api/class/restore/:id
export const restoreClass = useCatchAsync(async (req: Request, res: Response) => {
	const id: string = req.params.id;

	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('id must type must be object id, id received:' + id);
	}

	const result = await ClassService.restoreClass(id);

	return res.status(HttpStatusCode.CREATED).json(result);
});

// [GET] /api/classes?_sort=className&_order=desc
export const getClasses = useCatchAsync(async (req: Request, res: Response) => {
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
});

// [GET] /api/class/:id
export const getOneClass = useCatchAsync(async (req: Request, res: Response) => {
	const id = req.params.id;
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('Missing parameter');
	}

	const classResult = await ClassService.getOneClass(id);

	if (!classResult) {
		throw createHttpError.NotFound('Class not found');
	}

	return res.status(HttpStatusCode.OK).json(classResult);
});

// [GET] /api/classes/trash
export const getClassTrash = useCatchAsync(async (req: Request, res: Response) => {
	const result = await ClassModel.findWithDeleted({
		deleted: true
	});

	return res.status(HttpStatusCode.OK).json(result);
});
