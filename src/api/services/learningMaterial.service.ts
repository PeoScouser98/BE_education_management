import mongoose, { FilterQuery, MongooseError, PaginateOptions } from 'mongoose';
import LearningMaterialModel from '../models/learningMaterial.model';
import { deleteFile } from './googleDrive.service';
import { ILearningMaterial } from '../../types/learningMaterial.type';

// Get files
export const getFiles = async (filterQuery: FilterQuery<ILearningMaterial> | undefined, query: PaginateOptions) => {
	try {
		return await LearningMaterialModel.paginate(filterQuery, query);
	} catch (error) {
		throw error as MongooseError;
	}
};

// Save file to database
export const saveFile = async (payload: Pick<ILearningMaterial, 'fileName' & 'mimeType' & 'subject' & 'grade'>) => {
	try {
		console.log(payload);
		return await new LearningMaterialModel(payload).save();
	} catch (error) {
		throw error as MongooseError;
	}
};

// Update file information
export const updateFile = async (fileId: string, payload: Partial<ILearningMaterial>) => {
	try {
		return await LearningMaterialModel.findOneAndUpdate({ fileId }, payload, {
			new: true
		});
	} catch (error) {
		throw error as MongooseError;
	}
};

// Temporarily delete file
export const softDeleteFile = async (fileId: string) => {
	try {
		return await LearningMaterialModel.delete({ fileId });
	} catch (error) {
		throw error as MongooseError;
	}
};

// Hard delete in both google drive store and database
export const hardDeleteFile = async (fileId: string) => {
	try {
		return await Promise.all([LearningMaterialModel.findOneAndDelete({ fileId }), deleteFile(fileId)]);
	} catch (error) {
		throw error as MongooseError;
	}
};

// Restore deleted file
export const restoreDeletedFile = async (fileId: string) => {
	try {
		return await LearningMaterialModel.restore({ fileId });
	} catch (error) {
		throw error as MongooseError;
	}
};
