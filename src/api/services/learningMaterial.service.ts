import mongoose, { FilterQuery, MongooseError, PaginateOptions } from 'mongoose'
import LearningMaterialModel from '../models/learningMaterial.model'
import { deleteFile } from './googleDrive.service'
import { ILearningMaterial } from '../../types/learningMaterial.type'

// Get files
export const getFiles = async (filterQuery: FilterQuery<ILearningMaterial> | undefined, query: PaginateOptions) => {
	return await LearningMaterialModel.paginate(filterQuery, query)
}

// Save file to database
export const saveFile = async (payload: Pick<ILearningMaterial, 'fileName' & 'mimeType' & 'subject' & 'grade'>) => {
	return await new LearningMaterialModel(payload).save()
}

// Update file information
export const updateFile = async (fileId: string, payload: Partial<ILearningMaterial>) => {
	return await LearningMaterialModel.findOneAndUpdate({ fileId }, payload, {
		new: true
	})
}

// Temporarily delete file
export const softDeleteFile = async (fileId: string) => await LearningMaterialModel.delete({ fileId })

// Hard delete in both google drive store and database
export const hardDeleteFile = async (fileId: string) => {
	return await Promise.all([LearningMaterialModel.findOneAndDelete({ fileId }), deleteFile(fileId)])
}

// Restore deleted file
export const restoreDeletedFile = async (fileId: string) => await LearningMaterialModel.restore({ fileId })
