/* eslint-disable no-mixed-spaces-and-tabs */
import 'dotenv/config';
import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { MongooseError, PaginateOptions } from 'mongoose';
import { multiFieldSortObjectParser } from '../../helpers/queryParams';
import * as googleDriveService from '../services/googleDrive.service';
import * as learningMaterialService from '../services/learningMaterial.service';
import { checkValidMimeType } from './../validations/file.validations';
import { HttpException } from '../../types/httpException.type';
import { HttpStatusCode } from '../../configs/statusCode.config';

export const getFiles = async (req: Request, res: Response) => {
	try {
		const sort = multiFieldSortObjectParser({
			_sort: req.query._sort as string,
			_order: req.query.order as string,
		});

		const query: PaginateOptions = {
			limit: +req.query._limit! || 20,
			page: +req.query._page!,
			sort: sort || {},
		};

		if (!req.query.grade && !req.query.subject) {
			const allFiles = await learningMaterialService.getFiles({ deleted: false }, query);
			return res.status(HttpStatusCode.OK).json(allFiles);
		} else {
			const files = await learningMaterialService.getFiles(
				{ subject: req.query.subject, grade: req.query.grade },
				query
			);
			return res.status(HttpStatusCode.OK).json(files);
		}
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const uploadFile = async (req: Request, res: Response) => {
	try {
		const [file] = req.files as Express.Multer.File[];
		if (!file) {
			throw createHttpError.BadRequest('File must be provided!');
		}
		if (!checkValidMimeType(file)) {
			throw createHttpError.UnprocessableEntity('File type is not allowed to upload!');
		}

		const uploadedFile = await googleDriveService.uploadFile(file, process.env.FOLDER_ID!);

		const newFile = {
			fileId: uploadedFile?.data.id,
			fileName: file.originalname,
			mimeType: file.mimetype,
			subject: req.body.subject,
			grade: +req.body.grade,
		};
		const savedFile = await learningMaterialService.saveFile(newFile);
		return res.status(HttpStatusCode.CREATED).json(savedFile);
	} catch (error) {
		return res.status((error as HttpError).status || 500).json({
			message: (error as HttpError).message,
			statusCode: (error as HttpError).status || 400,
		});
	}
};

export const updateFile = async (req: Request, res: Response) => {
	try {
		const updatedFile = await learningMaterialService.updateFile(req.params.fileId, req.body);
		return res.status(HttpStatusCode.CREATED).json(updatedFile);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const deleteFile = async (req: Request, res: Response) => {
	try {
		if (req.query.hard_delete) {
			const deletedFileInDb = await learningMaterialService.hardDeleteFile(req.params.fileId);
			const deletedFile = await googleDriveService.deleteFile(req.params.fileId);

			return res.status(HttpStatusCode.NO_CONTENT).json({
				deletedFile,
				deletedFileInDb,
			});
		} else {
			const tempDeletedFile = await learningMaterialService.softDeleteFile(req.params.fileId);
			return res.status(HttpStatusCode.NO_CONTENT).json(tempDeletedFile);
		}
	} catch (error) {
		console.log((error as HttpError | MongooseError).message);

		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};

export const restoreFile = async (req: Request, res: Response) => {
	try {
		const restoredFile = await learningMaterialService.restoreDeletedFile(req.params.fileId);
		return res.status(HttpStatusCode.OK).json(restoredFile);
	} catch (error) {
		const httpException = new HttpException(error);
		return res.status(httpException.statusCode).json(httpException);
	}
};
