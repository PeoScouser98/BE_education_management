import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { compareObject } from '../../helpers/toolkit';
import { IClass } from '../../types/class.type';
import ClassModel from '../models/class.model';
import { validateClassData, validateClassEditData } from '../validations/class.validation';

export const createClass = async (payload: Omit<IClass, '_id'>) => {
	try {
		const validateCheck = validateClassData(payload);

		if (validateCheck.error) {
			throw createHttpError(502, validateCheck.error.message);
		}
		const { exists } = await checkClassesExists('', { className: payload.className });

		if (exists) {
			throw createHttpError(409, `Class ${payload.className} already exists`);
		}

		const classResult: IClass = await new ClassModel(payload).save();
		return {
			classes: classResult,
		};
	} catch (error) {
		throw error;
	}
};

export const checkClassesExists = async (_id: string, condition: Partial<IClass> = {}) => {
	try {
		let conditionCurr: any = { ...condition };
		if (_id) {
			// kiểm tra xem _id gửi lên đúng kiểu objectId
			if (!mongoose.Types.ObjectId.isValid(_id)) {
				throw createHttpError.BadRequest('_id of the classes is invalid');
			}

			conditionCurr = {
				...condition,
				_id,
			};
		}

		const classes: IClass | null = await ClassModel.findOne({
			...conditionCurr,
		});

		return {
			exists: !!classes,
			classes: classes,
		};
	} catch (error) {
		throw error;
	}
};

export const updateClasses = async (payload: Partial<Omit<IClass, '_id'>>, _id: string) => {
	try {
		// trường hợp data rỗng
		if (Object.keys(payload).length === 0) {
			throw createHttpError(304);
		}

		const { exists, classes } = await checkClassesExists(_id);

		// trường hợp className và grade không khớp nhau
		if (
			payload.className &&
			!payload.grade &&
			!payload.className.startsWith(JSON.stringify(classes?.grade))
		) {
			throw createHttpError.BadRequest('Invalid Class name, classname: grade+"A|B|C|D..."');
		}

		if (!exists) {
			throw createHttpError.NotFound('Classes does not exist');
		}

		// check validate data gửi lên
		const { error } = validateClassEditData(payload);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		return await ClassModel.findOneAndUpdate({ _id }, payload, { new: true });
	} catch (error) {
		throw error;
	}
};

export const softDeleteClass = async (id: string) => {
	try {
		await ClassModel.delete({ _id: id });

		return {
			message: 'Moved the class to the trash',
			statusCode: 200,
		};
	} catch (error) {
		throw error;
	}
};

export const restoreClass = async (id: string) => {
	try {
		await ClassModel.restore({ _id: id });

		return {
			message: 'Class have been restored',
			statusCode: 200,
		};
	} catch (error) {
		throw error;
	}
};

export const forceDeleteClass = async (id: string) => {
	try {
		await ClassModel.deleteOne({ _id: id });

		return {
			message: 'Class has been permanently deleted',
			statusCode: 200,
		};
	} catch (error) {
		throw error;
	}
};
