import createHttpError from 'http-errors';
import mongoose, { ObjectId } from 'mongoose';
import { createSlug } from '../../helpers/toolkit';
import SubjectModel from '../models/subject.model';
import { validateSubjectRequestBody, validateSubjectUpdateBody } from '../validations/subject.validation';
import { ISubject } from '../../types/subject.type';
import { HttpStatusCode } from '../../configs/statusCode.config';

interface ISubjectCondition {
	_id: ObjectId | string;
	subjectName: string | any;
	slug: string;
}

export const getAllSubjects = async () => await SubjectModel.find().sort({ subjectName: 1 });

export const getOneSubject = async (subjectId: string) => await SubjectModel.findById(subjectId);

export const createNewSubject = async (subject: Omit<ISubject, '_id'>) => {
	if (!subject) throw createHttpError(HttpStatusCode.NO_CONTENT);

	// check validate
	const { error } = validateSubjectRequestBody(subject);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}

	// check tồn tại
	const exist = await checkSubjectExist({
		subjectName: subject.subjectName
	});
	if (exist) {
		throw createHttpError.Conflict('Subject already exists');
	}

	const subjectResult = await new SubjectModel(subject).save();
	return subjectResult;
};

// Check sự tồn tại của 1 subject
export const checkSubjectExist = async (condition: Partial<ISubjectCondition>) => {
	if ('subjectName' in condition) {
		const slug = createSlug(condition.subjectName);
		condition = {
			slug
		};
	}
	const subject: ISubject | null = await SubjectModel.findOne(condition);

	return !!subject;
};

// update
export const updateSubject = async (id: string, subject: Partial<Omit<ISubject, '_id'>>) => {
	if (!id) {
		throw createHttpError.BadRequest('Missing parameter');
	}
	if (Object.keys(subject).length === 0) {
		throw createHttpError(HttpStatusCode.NO_CONTENT);
	}

	const { error } = validateSubjectUpdateBody(subject);

	if (error) {
		throw createHttpError.BadRequest(error.message);
	}

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('_id of the subject is invalid');
	}

	// check tồn tại
	const exist = await checkSubjectExist({ _id: id });
	if (!exist) {
		throw createHttpError.NotFound('Subject does not exist');
	}

	// sửa slug
	if (subject.subjectName) {
		const slug = createSlug(subject.subjectName);
		subject = {
			...subject,
			slug
		};
	}
	return await SubjectModel.findOneAndUpdate({ _id: id }, subject, {
		new: true
	});
};

// delete soft
export const deleteSoft = async (id: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('_id of the subject is invalid');
	}
	await SubjectModel.delete({ _id: id });

	return {
		message: 'Moved the class to the trash',
		statusCode: 200
	};
};

// force delete
export const deleteForce = async (id: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('_id of the subject is invalid');
	}
	await SubjectModel.deleteOne({ _id: id });

	return {
		message: 'Class has been permanently deleted',
		statusCode: 200
	};
};

// get trash
export const getTrash = async () => await SubjectModel.findWithDeleted({ deleted: true });

// restore
export const restore = async (id: string) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('_id of the subject is invalid');
	}
	await SubjectModel.restore({ _id: id });

	return {
		message: 'Subject have been restored',
		statusCode: 201
	};
};
