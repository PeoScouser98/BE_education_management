import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { compareObject, getPropertieOfArray } from '../../helpers/toolkit';
import ClassModel, { Class } from '../models/class.model';
import { validateClassData, validateClassEditData } from '../validations/class.validation';

interface ErrorPayloadCreates {
	className: string;
	message?: string;
}

export const createClass = async (payload: Omit<Class, '_id'> | Omit<Class, '_id'>[]) => {
	let error: { statusCode: number; errorData?: ErrorPayloadCreates[]; message?: string } | null =
		null;
	try {
		// trường hợp thêm nhiều class
		if (Array.isArray(payload)) {
			// không có data gửi lên
			if (payload.length === 0) {
				error = {
					statusCode: 204,
					message: 'No content',
				};
				return { error };
			}

			// check validate data
			const errorValidateData: ErrorPayloadCreates[] = [];
			const suitableValidateData: Omit<Class, '_id'>[] = payload.filter((item) => {
				let { error } = validateClassData(item);
				if (error) {
					errorValidateData.push({
						className: item.className,
						message: error.message,
					});
				}
				return !Boolean(error);
			});

			if (errorValidateData.length > 0) {
				error = { statusCode: 502, errorData: errorValidateData };
				return { error };
			}

			const classNameData = getPropertieOfArray(suitableValidateData, 'className');

			// kiểm tra tồn tại của className trong db
			const checkClassName: Pick<Class, 'className'>[] = await ClassModel.find({
				className: { $in: classNameData },
			}).select(['className']);

			const errorExistData: ErrorPayloadCreates[] = [];
			const suitableData: Omit<Class, '_id'>[] = suitableValidateData.filter((item) => {
				let check = checkClassName.find(
					(itemClassName) => item.className === itemClassName.className
				);
				if (check) {
					errorExistData.push({
						className: check.className,
					});
				}

				return !Boolean(check);
			});

			if (errorExistData.length > 0) {
				error = {
					statusCode: 409,
					message: 'Classes already exists',
					errorData: errorExistData,
				};
				return { error };
			}

			const classesResult: Class[] = await ClassModel.insertMany(suitableData);

			return {
				classes: classesResult,
			};
		} else {
			// thêm 1
			const validateCheck = validateClassData(payload);

			if (validateCheck.error) {
				return {
					error: {
						statusCode: 502,
						message: validateCheck.error.message,
					},
				};
			}
			const { exists } = await checkClassesExists('', { className: payload.className });

			if (exists) {
				return {
					error: {
						statusCode: 409,
						message: `Class ${payload.className} already exists`,
					},
				};
			}

			const classResult: Class = await new ClassModel(payload).save();
			return {
				classes: classResult,
			};
		}
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
