import { ILearningMaterial } from './../models/learningMaterial.model';
import 'dotenv/config';
import { Request, Response } from 'express';
import { uploadFile } from '../../app/googleDrive';
import { Grade } from '../../types/class.type';
import { Subject } from '../models/subject.model';
import * as learningMaterialService from '../services/learningMaterial.service';
import mongoose from 'mongoose';

export const postFile = async (req: Request, res: Response) => {
	try {
		const [file] = req.files as File[];

		const uploadedFile = await uploadFile(file, process.env.FOLDER_ID!);
		const newFile: Partial<ILearningMaterial> = {
			fileId: uploadedFile?.data.id as string,
			fileName: file.originalname,
			mimeType: file.mimetype,
			subject: req.body.subject as string,
			grade: req.body.grade as number,
		};
		const savedFile = await learningMaterialService.saveFile(newFile);
		console.log(savedFile);
		return res.status(201).json({
			message: 'ok',
			file: savedFile,
			status: 201,
		});
	} catch (error) {
		console.log((error as Error).message);
	}
};
