import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { ISubject } from '../../types/subject.type';
import LearningMaterialModel from '../models/learningMaterial.model';
import SubjectModel from '../models/subject.model';
import { validateSubjectRequestBody, validateSubjectUpdateBody } from '../validations/subject.validation';

export const getAllSubjects = async () => await SubjectModel.find().sort({ subjectName: 1 });

export const getOneSubject = async (subjectId: string) => await SubjectModel.findById(subjectId);

export const createNewSubject = async (subject: Omit<ISubject, '_id'>) => {
	// check validate
	const { error } = validateSubjectRequestBody(subject);
	if (error) throw createHttpError.BadRequest(error.message);
	// check tồn tại
	const duplicatedSubjectCode = await SubjectModel.exists({
		subjectCode: subject.subjectCode.toUpperCase()
	});
	if (duplicatedSubjectCode) throw createHttpError.Conflict('Subject already exists');
	const newSubject = await new SubjectModel(subject).save();
	return newSubject;
};

// update
export const updateSubject = async (id: string, subject: Partial<Omit<ISubject, '_id'>>) => {
	if (!id) {
		throw createHttpError.BadRequest('Missing parameter');
	}
	const { error, value } = validateSubjectUpdateBody(subject);
	if (error) throw createHttpError.BadRequest(error.message);
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid subject ID!');
	// check tồn tại
	const existedSubject = await SubjectModel.exists({ _id: id });
	if (!existedSubject) {
		throw createHttpError.NotFound('Subject does not exist');
	}
	const duplicatedSubjectCode = await SubjectModel.exists({
		_id: { $ne: id },
		subjectCode: subject.subjectCode?.toUpperCase()
	});
	if (duplicatedSubjectCode) throw createHttpError.Conflict('Subject code already existed!');
	return await SubjectModel.findOneAndUpdate({ _id: id }, value, { new: true });
};

// delete soft
export const deleteSoft = async (id: string) => {
	const learningMaterialBySubject = await LearningMaterialModel.exists({ subject: id });
	if (learningMaterialBySubject)
		throw createHttpError.Conflict('Cannot delete this subject due to existing learning material of this subject !');
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('_id of the subject is invalid');
	return await SubjectModel.delete({ _id: id });
};

// force delete
export const deleteForce = async (id: string) => {
	const learningMaterialBySubject = await LearningMaterialModel.exists({ subject: id });
	if (learningMaterialBySubject)
		throw createHttpError.Conflict('Cannot delete this subject due to existing learning material of this subject !');
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('_id of the subject is invalid');
	return await SubjectModel.deleteOne({ _id: id });
};

// get trash
export const getTrash = async () => await SubjectModel.findWithDeleted({ deleted: true });

// restore
export const restore = async (id: string) => {
	if (!isValidObjectId(id)) throw createHttpError.BadRequest('Invalid subject ID !');
	await SubjectModel.restore({ _id: id });
	return {
		message: 'Subject have been restored',
		statusCode: 201
	};
};
