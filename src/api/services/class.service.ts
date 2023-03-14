import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { compareObject } from '../../helpers/toolkit';
import ClassModel, { Class } from '../models/class.model';
import { validateClassEditData } from '../validations/class.validation';

export const createClass = async (payload: Omit<Class, '_id'>) => {
	try {
		return await new ClassModel(payload).save();
	} catch (error) {
		throw error;
	}
};

export const checkClassesExists = async (_id: string, condition: Partial<Class> = {}) => {
	try {
		let conditionCurr: any = { ...condition };
		if (_id) {
			// kiểm tra xem _id gửi lên đúng kiểu objectId
			if (!mongoose.Types.ObjectId.isValid(_id)) {
				throw createHttpError.NotFound('_id of the classes is invalid');
			}

			conditionCurr = {
				...condition,
				_id,
			};
		}

		const classe: Class | null = await ClassModel.findOne({
			...conditionCurr,
		});

		return {
			exists: classe ? true : false,
			classe,
		};
	} catch (error) {
		throw error;
	}
};

export const updateClasses = async (payload: Partial<Omit<Class, '_id'>>, _id: string) => {
	try {
		let errorResult: { message: string; statusCode: number } | null = null;
		// trường hợp data rỗng
		if (Object.keys(payload).length === 0) {
			errorResult = {
				message: 'Not Modified',
				statusCode: 304,
			};

			return { errorResult };
		}

		const { exists, classe } = await checkClassesExists(_id);

		// trường hợp className và grade không khớp nhau
		if (
			payload.className &&
			!payload.grade &&
			!payload.className.startsWith(JSON.stringify(classe?.grade))
		) {
			throw createHttpError.BadRequest('Invalid Class name, classname: grade+"A|B|C|D..."');
		}

		if (!exists) {
			throw createHttpError.NotFound('Classes does not exist');
		}

		// check validate data gửi lên
		const { error } = validateClassEditData(payload);
		if (error) {
			throw createHttpError.BadGateway(error.message);
		}

		// check xem dữ liệu sửa có giống với dữ liệu cũ hay không
		if (
			(() => {
				const classOld = { ...JSON.parse(JSON.stringify(classe)) };
				delete classOld._id;

				return compareObject({ ...classOld, ...payload }, classOld);
			})()
		) {
			errorResult = {
				message: 'Not Modified',
				statusCode: 304,
			};

			return {
				errorResult,
			};
		}
		const newClasses = await ClassModel.findOneAndUpdate({ _id }, payload, { new: true });

		return {
			newClasses,
			errorResult,
		};
	} catch (error) {
		throw error;
	}
};
