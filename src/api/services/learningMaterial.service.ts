import { MongooseError } from 'mongoose';
import LearningMaterialModel from '../models/learningMaterial.model';
import { LearningMaterial } from './../models/learningMaterial.model';

export const getBySubject = async (subjectId: string) => {
	try {
		return await LearningMaterialModel.find({ subject: subjectId }).exec((error, result) => {
			if (error) console.log(error.message);
		});
	} catch (error) {
		throw error as MongooseError;
	}
};

export const add = async (payload: Omit<LearningMaterial, '_id'>) => {
	try {
		return await new LearningMaterialModel(payload).save();
	} catch (error) {
		throw error as MongooseError;
	}
};

export const update = async (materialId: string, payload: Partial<LearningMaterial>) => {
	try {
		return await LearningMaterialModel.findOneAndUpdate(
			{
				_id: materialId,
			},
			payload,
			{ new: true }
		);
	} catch (error) {
		throw error as MongooseError;
	}
};

export const hardDelete = async (id: string) => {};
