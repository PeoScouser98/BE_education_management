import createHttpError from 'http-errors';
import mongoose, { SortOrder } from 'mongoose';
import { compareObject, generateStudentID } from '../../helpers/toolkit';
import StudentModel, { Student } from '../models/student.model';
import {
	validateReqBodyStudent,
	validateUpdateReqBodyStudent,
} from '../validations/student.validation';

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

// update
export const updateStudent = async (id: string, data: Partial<Omit<Student, '_id' | 'code'>>) => {
	try {
		if (!data || Object.keys(data).length === 0) {
			throw createHttpError(204);
		}
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.BadRequest('_id of the student is invalid');
		}

		// validate
		const { error } = validateUpdateReqBodyStudent(data);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		// check sự tồn tại
		const student = await StudentModel.findOne({
			_id: id,
		});

		if (!student) {
			throw createHttpError.NotFound('Student does not exist!');
		}

		// check xem dữ liệu sửa có giống với dữ liệu cũ hay không
		if (
			(() => {
				const classOld = { ...JSON.parse(JSON.stringify(student)) };
				delete classOld._id;

				return compareObject({ ...classOld, ...data }, classOld);
			})()
		) {
			throw createHttpError(304);
		}

		const newCode = updateCodeStudent(data, student);
		let dataUpdate: Partial<Omit<Student, '_id'>> = { ...data };

		if (newCode && typeof newCode === 'string') {
			dataUpdate.code = newCode;
		}

		return await StudentModel.findOneAndUpdate({ _id: id }, dataUpdate, { new: true });
	} catch (error) {
		throw error;
	}
};

// update code
const updateCodeStudent = (
	dataUpdate: Partial<Omit<Student, '_id'>>,
	dataOld: Student
): string | undefined => {
	try {
		if (dataUpdate.fullName && !dataUpdate.parentsPhoneNumber) {
			return generateStudentID(dataUpdate.fullName, dataOld.parentsPhoneNumber);
		} else if (!dataUpdate.fullName && dataUpdate.parentsPhoneNumber) {
			return generateStudentID(dataOld.fullName, dataUpdate.parentsPhoneNumber);
		} else if (dataUpdate.fullName && dataUpdate.parentsPhoneNumber) {
			return generateStudentID(dataUpdate.fullName, dataUpdate.parentsPhoneNumber);
		}
		return undefined;
	} catch (error) {
		throw error;
	}
};

// get student theo class
export const getStudentByClass = async (
	idClass: string,
	page: number,
	limit: number,
	order: SortOrder,
	groupBy: string,
	select: string
) => {
	try {
		if (!idClass || !mongoose.Types.ObjectId.isValid(idClass)) {
			throw createHttpError.BadRequest('_id of the class is invalid');
		}

		const availableSortFields = [
			'code',
			'fullName',
			'gender',
			'dateOfBirth',
			'class',
			'parentsPhoneNumber',
			'isPolicyBeneficiary',
			'isGraduated',
		];

		if (!availableSortFields.includes(groupBy)) {
			throw createHttpError.BadRequest(
				"_sort can only belong to ['code','fullName','gender','dateOfBirth','class','parentsPhoneNumber','isPolicyBeneficiary','isGraduated']"
			);
		}

		return await StudentModel.paginate(
			{ class: idClass, dropoutDate: null, transferSchool: null },
			{ page: page, limit: limit, select: select, sort: { [groupBy]: order } }
		);
	} catch (error) {
		throw error;
	}
};

// get detail student
export const getDetailStudent = async (id: string) => {
	try {
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			throw createHttpError.BadRequest('_id of the student is invalid');
		}

		const student: Student | null = await StudentModel.findOne({
			_id: id,
		}).populate({
			path: 'class',
			select: 'className headTeacher',
		});

		if (!student) {
			throw createHttpError.NotFound('Student does not exist!');
		}

		return student;
	} catch (error) {
		throw error;
	}
};

// h/s chuyển trường
export const setStudentTransferSchool = async (id: string, date: string) => {
	try {
		if (!id) {
			throw createHttpError.BadRequest('_id of the student is invalid');
		}

		const dateCheck = new Date(date);
		if (isNaN(dateCheck.getTime())) {
			throw createHttpError.BadRequest(
				'The Date you passed is not in the correct Date data type'
			);
		}

		// check xem có còn học ở trường không
		const student = await StudentModel.findOne({
			_id: id,
			transferSchool: null,
			dropoutDate: null,
		});

		if (!student) {
			throw createHttpError.NotFound(
				'The student has transferred to another school or dropped out'
			);
		}
		return await StudentModel.findOneAndUpdate(
			{ _id: id },
			{ transferSchool: date },
			{ new: true }
		);
	} catch (error) {
		throw error;
	}
};

// hs nghỉ học
export const setDropoutStudent = async (id: string, date: string) => {
	try {
		if (!id) {
			throw createHttpError.BadRequest('_id of the student is invalid');
		}

		const dateCheck = new Date(date);
		if (isNaN(dateCheck.getTime())) {
			throw createHttpError.BadRequest(
				'The Date you passed is not in the correct Date data type'
			);
		}

		// check xem có còn học ở trường không
		const student = await StudentModel.findOne({
			_id: id,
			transferSchool: null,
			dropoutDate: null,
		});

		if (!student) {
			throw createHttpError.NotFound(
				'The student has transferred to another school or dropped out'
			);
		}
		return await StudentModel.findOneAndUpdate(
			{ _id: id },
			{ dropoutDate: date },
			{ new: true }
		);
	} catch (error) {
		throw error;
	}
};

// Lấy ra các học sinh đã chuyển trường
export const getStudentTransferSchool = async (
	year: number | 'all',
	page: number,
	limit: number
) => {
	try {
		let condition: any = { $expr: { $eq: [{ $year: '$transferSchool' }, year] } };
		if (year === 'all') {
			condition = { transferSchool: { $ne: null } };
		}

		return await StudentModel.paginate(condition, { page: page, limit: limit });
	} catch (error) {
		throw error;
	}
};

export const getStudentDropout = async (year: 'all' | number, page: number, limit: number) => {
	try {
		let condition: any = { $expr: { $eq: [{ $year: '$dropoutDate' }, year] } };

		if (year === 'all') {
			condition = { dropoutDate: { $ne: null } };
		}

		return await StudentModel.paginate(condition, { page: page, limit: limit });
	} catch (error) {
		throw error;
	}
};
