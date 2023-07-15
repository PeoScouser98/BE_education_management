/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-mixed-spaces-and-tabs */
import 'dotenv/config'
import { Request, Response } from 'express'
import createHttpError from 'http-errors'
import { PaginateOptions } from 'mongoose'
import { HttpStatusCode } from '../../configs/statusCode.config'
import { multiFieldSortObjectParser } from '../../helpers/queryParams'
import { getFileSize } from '../../helpers/toolkit'
import useCatchAsync from '../../helpers/useCatchAsync'
import { ILearningMaterial } from '../../types/learningMaterial.type'
import * as googleDriveService from '../services/googleDrive.service'
import * as learningMaterialService from '../services/learningMaterial.service'
import { checkValidMimeType } from './../validations/file.validations'

export const getFiles = useCatchAsync(async (req: Request, res: Response) => {
	const sort = multiFieldSortObjectParser({
		_sort: req.query._sort as string,
		_order: req.query._order as string
	})

	const query: PaginateOptions = {
		limit: +req.query._limit! || 20,
		page: +req.query._page!,
		sort: sort || {}
	}

	if (!req.query._grade && !req.query._subject) {
		const allFiles = await learningMaterialService.getFiles({ deleted: false }, query)
		return res.status(HttpStatusCode.OK).json(allFiles)
	} else {
		const files = await learningMaterialService.getFiles(
			{ subject: req.query._subject, grade: req.query._grade },
			query
		)
		return res.status(HttpStatusCode.OK).json(files)
	}
})

export const uploadFile = useCatchAsync(async (req: Request, res: Response) => {
	const [file] = req.files as Express.Multer.File[]
	const user = req.profile
	if (!file) {
		throw createHttpError.BadRequest('File must be provided!')
	}
	if (!checkValidMimeType(file)) {
		throw createHttpError.UnprocessableEntity('File type is not allowed to upload!')
	}

	const uploadedFile = await googleDriveService.uploadFile(file, process.env.FOLDER_ID!)
	if (!uploadedFile) {
		throw createHttpError.UnprocessableEntity('Failed to upload file')
	}
	const newFile = {
		fileId: uploadedFile.data?.id as string,
		title: req.body.title,
		mimeType: file.mimetype,
		fileSize: getFileSize(file.size),
		subject: req.body.subject,
		uploadedBy: user._id
	} as Omit<ILearningMaterial, '_id' | 'downloadUrl'>

	const savedFile = await learningMaterialService.saveFile(newFile)

	return res.status(HttpStatusCode.CREATED).json(savedFile)
})

export const updateFile = useCatchAsync(async (req: Request, res: Response) => {
	const updatedFile = await learningMaterialService.updateFile(req.params.fileId, req.body)
	return res.status(HttpStatusCode.CREATED).json(updatedFile)
})

export const deleteFile = useCatchAsync(async (req: Request, res: Response) => {
	if (req.query.hard_delete) {
		const deletedFileInDb = await learningMaterialService.hardDeleteFile(req.params.fileId)
		const deletedFile = await googleDriveService.deleteFile(req.params.fileId)

		return res.status(HttpStatusCode.NO_CONTENT).json({
			deletedFile,
			deletedFileInDb
		})
	} else {
		const tempDeletedFile = await learningMaterialService.softDeleteFile(req.params.fileId)
		return res.status(HttpStatusCode.NO_CONTENT).json(tempDeletedFile)
	}
})

export const restoreFile = useCatchAsync(async (req: Request, res: Response) => {
	const restoredFile = await learningMaterialService.restoreDeletedFile(req.params.fileId)
	return res.status(HttpStatusCode.OK).json(restoredFile)
})
