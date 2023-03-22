import createHttpError from 'http-errors';
import mongoose, { ObjectId } from 'mongoose';
import { createSlug } from '../../helpers/toolkit';
import SubjectModel, { Subject } from '../models/subject.model';
import {
	validateSubjectRequestBody,
	validateSubjectUpdateBody,
} from '../validations/subject.validation';

interface ISubjectCondition {
	_id: ObjectId | string;
	subjectName: string | any;
	slug: string;
}

export const getAllSubjects = async () => {
	try {
		return await SubjectModel.find().sort({ subjectName: 1 });
	} catch (error) {
		throw error;
	}
};

export const createNewSubject = async (subject: Omit<Subject, '_id'>) => {
	try {
		if (!subject) throw createHttpError(204);

		// check validate
		const { error } = validateSubjectRequestBody(subject);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		// check tồn tại
		const exist = await checkSubjectExist({ subjectName: subject.subjectName });
		if (exist) {
			throw createHttpError.Conflict('Subject already exists');
		}

		const subjectResult = await new SubjectModel(subject).save();
		return subjectResult;
	} catch (error) {
		throw error;
	}
};

// Check sự tồn tại của 1 subject
export const checkSubjectExist = async (condition: Partial<ISubjectCondition>) => {
	try {
		if ('subjectName' in condition) {
			const slug = createSlug(condition.subjectName);
			condition = {
				slug,
			};
		}
		const subject: Subject | null = await SubjectModel.findOne(condition);

		return subject ? true : false;
	} catch (error) {
		throw error;
	}
};

// update
export const updateSubject = async (id: string, subject: Partial<Omit<Subject, '_id'>>) => {
	try {
		if (!id) {
			throw createHttpError.BadRequest('Missing parameter');
		}
		if (Object.keys(subject).length === 0) {
			throw createHttpError(204);
		}

		const { error } = validateSubjectUpdateBody(subject);

		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.NotFound('_id of the subject is invalid');
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
				slug,
			};
		}
		return await SubjectModel.findOneAndUpdate({ _id: id }, subject, { new: true });
	} catch (error) {
		throw error;
	}
};

// delete soft
export const deleteSoft = async (id: string) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.NotFound('_id of the subject is invalid');
		}
		await SubjectModel.delete({ _id: id });

		return {
			message: 'Moved the class to the trash',
			statusCode: 200,
		};
	} catch (error) {
		throw error;
	}
};

// force delete
export const deleteForce = async (id: string) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.NotFound('_id of the subject is invalid');
		}
		await SubjectModel.deleteOne({ _id: id });
		return {
			message: 'Class has been permanently deleted',
			statusCode: 200,
		};
	} catch (error) {
		throw error;
	}
};

// get trash
export const getTrash = async () => {
	try {
		return await SubjectModel.findWithDeleted({ deleted: true });
	} catch (error) {
		throw error;
	}
};

// restore
export const restore = async (id: string) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.NotFound('_id of the subject is invalid');
		}
		await SubjectModel.restore({ _id: id });
		return {
			message: 'Subject have been restored',
			statusCode: 200,
		};
	} catch (error) {
		throw error;
	}
};
