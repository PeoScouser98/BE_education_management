import mongoose, { MongooseError } from 'mongoose';
import LearningMaterialModel from '../models/learningMaterial.model';
import { ILearningMaterial } from './../models/learningMaterial.model';

export const getBySubject = async (subjectId: string) => {
	try {
		return await LearningMaterialModel.find({ subject: subjectId }).exec((error, result) => {
			if (error) console.log(error.message);
		});
	} catch (error) {
		throw error as MongooseError;
	}
};

export const saveFile = async (payload: Partial<ILearningMaterial>) => {
	try {
		console.log(payload);
		return await new LearningMaterialModel({
			...payload,
			subject: new mongoose.Types.ObjectId(payload.subject!.toString()),
		}).save();
	} catch (error) {
		throw error as MongooseError;
	}
};

export const update = async (materialId: string, payload: Partial<ILearningMaterial>) => {
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

export const softDeleteLearningMaterial = async (fileId: string) => {
	try {
		return await LearningMaterialModel.delete({ fileId });
	} catch (error) {}
};
