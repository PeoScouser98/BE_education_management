import createHttpError from 'http-errors';
import { generateStudentID } from '../../helpers/toolkit';
import StudentModel, { Student } from '../models/student.model';
import { validateReqBodyStudent } from '../validations/student.validation';

interface IStudentErrorRes {
	fullName: string;
	parentPhone: string;
	message?: string;
}

// create new student using form
export const createStudent = async (data: Omit<Student, '_id'> | Omit<Student, '_id'>[]) => {
	try {
		// thêm nhiều học sinh cùng lúc
		if (Array.isArray(data)) {
			return await createStudentList(data);
		}

		// thêm 1 học sinh
		if (!data) {
			throw createHttpError(204);
		}

		const { error } = validateReqBodyStudent(data);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		const studentId = generateStudentID(data.fullName, data.parentsPhoneNumber);
		const check: Student | null = await StudentModel.findOne({
			code: studentId,
		});

		if (check) {
			throw createHttpError(409, 'Student already exists ');
		}

		return await new StudentModel(data).save();
	} catch (error) {
		throw error;
	}
};

const createStudentList = async (data: Omit<Student, '_id'>[]) => {
	try {
		if (data.length === 0) throw createHttpError(204);
		if (data.length > 50) {
			throw createHttpError.PayloadTooLarge(
				'You are only allowed to add 50 students at a time'
			);
		}

		// validate
		const studentErrorValidate: IStudentErrorRes[] = [];
		data.forEach((item) => {
			let { error } = validateReqBodyStudent(item);
			if (error) {
				studentErrorValidate.push({
					fullName: item.fullName,
					parentPhone: item.parentsPhoneNumber,
					message: error.message,
				});
			}
		});

		if (studentErrorValidate.length > 0) {
			throw createHttpError(400, 'The student does not satisfy the validation requirements', {
				error: studentErrorValidate,
			});
		}

		// check exist
		const studentExists: IStudentErrorRes[] = [];
		const studentCodes: string[] = data.map((item) =>
			generateStudentID(item.fullName, item.parentsPhoneNumber)
		);

		const studentExistDb = await StudentModel.find({
			code: { $in: studentCodes },
		});

		let check: any = null;
		studentExistDb.forEach((item) => {
			check = data.find(
				(itemData) =>
					generateStudentID(itemData.fullName, itemData.parentsPhoneNumber) === item.code
			);

			if (check) {
				studentExists.push({
					fullName: item.fullName,
					parentPhone: item.parentsPhoneNumber,
				});
			}
		});

		if (studentExists.length > 0) {
			throw createHttpError(409, 'Student already exists', { error: studentExists });
		}

		// save
		return await StudentModel.insertMany(data);
	} catch (error) {
		throw error;
	}
};
