import createHttpError from 'http-errors';
import mongoose, { SortOrder } from 'mongoose';
import { compareDates, compareObject, getPropertieOfArray } from '../../helpers/toolkit';
import ClassModel from '../models/class.model';
import StudentModel from '../models/student.model';
import {
	validateAttendanceStudent,
	validateReqBodyStudent,
	validateUpdateReqBodyStudent,
} from '../validations/student.validation';
import { selectTranscriptStudent } from './subjectTrancription.service';
import { ISubjectTranscript } from '../../types/subjectTranscription.type';
import { IAttendance, IStudent } from '../../types/student.type';
import { selectSchoolYearCurr } from './schoolYear.service';

interface IStudentErrorRes {
	fullName: string;
	parentPhone: string;
	message?: string;
}

interface IAbsentStudent {
	idStudent: string;
	absent?: Omit<IAttendance, '_id'>;
}

// create new student using form
export const createStudent = async (data: Omit<IStudent, '_id'> | Omit<IStudent, '_id'>[]) => {
	try {
		// thêm nhiều học sinh cùng lúc
		if (Array.isArray(data)) {
			return await createStudentList(data);
		}

		// thêm 1 học sinh
		if (!data) {
			throw createHttpError(HttpStatusCode.NO_CONTENT);
		}

		const { error } = validateReqBodyStudent(data);
		if (error) {
			throw createHttpError.BadRequest(error.message);
		}

		const check: IStudent | null = await StudentModel.findOne({
			code: data.code,
		});

		if (check) {
			throw createHttpError(409, 'Student already exists ');
		}

		return await new StudentModel(data).save();
	} catch (error) {
		throw error;
	}
};

const createStudentList = async (data: Omit<IStudent, '_id'>[]) => {
	try {
		if (data.length === 0) throw createHttpError(HttpStatusCode.NO_CONTENT);
		if (data.length > 50) {
			throw createHttpError.PayloadTooLarge(
				'You are only allowed to add 50 students at a time'
			);
		}

		// validate
		const studentErrorValidate: IStudentErrorRes[] = [];
		data.forEach((item) => {
			const { error } = validateReqBodyStudent(item);
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
		const studentCodes: string[] = data.map((item) => item.code);

		const studentExistDb = await StudentModel.find({
			code: { $in: studentCodes },
		});

		let check: any = null;
		studentExistDb.forEach((item) => {
			check = data.find((itemData) => itemData.code === item.code);

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
export const updateStudent = async (id: string, data: Partial<Omit<IStudent, '_id' | 'code'>>) => {
	try {
		if (!data || Object.keys(data).length === 0) {
			throw createHttpError(HttpStatusCode.NO_CONTENT);
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

		return await StudentModel.findOneAndUpdate({ _id: id }, data, { new: true });
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

		const student: IStudent | null = await StudentModel.findOne({
			_id: id,
		}).populate({
			path: 'class',
			select: 'className headTeacher',
		});

		const transcriptStudent: ISubjectTranscript[] = await selectTranscriptStudent(id);

		if (!student) {
			throw createHttpError.NotFound('Student does not exist!');
		}

		return {
			info: student,
			transcript: transcriptStudent,
		};
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

// điểm danh
export const markAttendanceStudent = async (idClass: string, absentStudents: IAbsentStudent[]) => {
	try {
		if (!absentStudents) {
			throw createHttpError(HttpStatusCode.NO_CONTENT);
		}

		if (!Array.isArray(absentStudents)) {
			throw createHttpError(400, 'The list of absent students is not an array type');
		}

		if (absentStudents.length === 0) {
			return {
				message: 'Attendance has been saved!',
			};
		}

		// nếu data gửi lên là 1 học sinh đã điểm danh trong ngày rồi

		// validate học sinh nghỉ gửi lên
		const errorValidates: { id: string; message: string }[] = [];

		let message = '';
		absentStudents.forEach((item) => {
			if (!item.idStudent || !mongoose.Types.ObjectId.isValid(item.idStudent)) {
				message = 'idStudent of the student is invalid';
			}

			if (item.absent) {
				const { error } = validateAttendanceStudent(item.absent);
				if (error) {
					message += ' && ' + error.message;
				}
			}

			if (message.length > 0) {
				errorValidates.push({ id: item.idStudent, message: message });
			}
		});

		if (errorValidates.length > 0) {
			throw createHttpError(400, 'The body data does not satisfy the validation', {
				error: errorValidates,
			});
		}

		// Lấy ra các id học sinh nghỉ
		const absentStudentIdList: string[] = getPropertieOfArray(absentStudents, 'idStudent');

		// Kiểm tra xem học sinh vắng có đúng học sinh của lớp không
		const checkExist: IStudent[] = await StudentModel.find({
			_id: { $in: absentStudentIdList },
			class: idClass,
		});

		const studentNotExist: string[] = [];
		if (checkExist.length !== absentStudentIdList.length) {
			absentStudentIdList.forEach((id) => {
				const check = checkExist.find((item) => item._id.toString() === id);

				if (!check) {
					studentNotExist.push(id);
				}
			});
		}

		if (studentNotExist.length > 0) {
			throw createHttpError(404, 'This student does not exist in the class', {
				error: studentNotExist,
			});
		}

		// kiểm tra xem học sinh vắng gửi lên đã tồn tại điểm danh trong ngày chưa ( nếu đã tồn tại thì bắn lỗi học sinh đã điểm danh về )
		const attendedStudents: { id: string; name: string }[] = [];

		checkExist.forEach((student) => {
			const check = student.absentDays?.find((item) => {
				const checkDate = compareDates(new Date(), item?.date);

				return checkDate === 0 ? true : false;
			});

			if (check) {
				attendedStudents.push({
					id: student._id.toString(),
					name: student.fullName,
				});
			}
		});

		if (attendedStudents.length > 0) {
			throw createHttpError(409, "Today's attendance for the student already exists", {
				error: attendedStudents,
			});
		}

		// lấy ra học kỳ hiện tại
		const schoolYearCurr = await selectSchoolYearCurr();

		// Thời gian điểm danh sẽ được server  tự động lấy là thời gian hiện tại
		const bulkUpdateAbsentStudents: any = absentStudents.map((item) => {
			return {
				updateOne: {
					filter: { _id: item.idStudent },
					update: {
						$push: {
							absentDays: {
								...item.absent,
								date: new Date(),
								schoolYear: schoolYearCurr._id,
							},
						},
					},
				},
			};
		});

		await StudentModel.bulkWrite(bulkUpdateAbsentStudents);

		return {
			message: 'Attendance has been saved!',
		};
	} catch (error) {
		throw error;
	}
};

// lấy ra tình trạng điểm danh của 1 lớp theo ngày
export const dailyAttendanceList = async (idClass: string, date: Date) => {
	try {
		if (!idClass || !mongoose.Types.ObjectId.isValid(idClass)) {
			throw createHttpError.BadRequest('The provided idClass is invalid');
		}

		// lấy ra các học sinh vắng mặt
		const nextDay = new Date(date);
		nextDay.setDate(nextDay.getDate() + 1);

		const studentAbsents: IStudent[] = await StudentModel.find({
			absentDays: {
				$elemMatch: {
					date: {
						$gte: date,
						$lt: nextDay,
					},
				},
			},
			class: idClass,
		}).lean();

		if (studentAbsents.length === 0) {
			return {
				absent: 0,
				students: [],
			};
		}

		const result = studentAbsents.map((item) => {
			let attendanceStatus = true;
			const check = studentAbsents.find(
				(itemAb) => itemAb._id.toString() === item._id.toString()
			);

			attendanceStatus = check ? false : true;
			return {
				...item,
				attendanceStatus: attendanceStatus,
			};
		});

		return {
			absent: studentAbsents.length,
			students: result,
		};
	} catch (error) {
		throw error;
	}
};

// Lấy ra tình trạng điểm danh của 1 học sinh trong 1 tháng (sẽ trả về ngày vắng mặt trong tháng đấy)
export const attendanceOfStudentByMonth = async (id: string, month: number, year: number) => {
	try {
		const {
			info: { absentDays },
		} = await getDetailStudent(id);

		const result: IAttendance[] = [];

		absentDays?.forEach((item) => {
			const date = new Date(item.date);
			const monthItem = date.getMonth() + 1;
			const yearItem = date.getFullYear();

			if (monthItem === month && yearItem === year) {
				result.push(item);
			}
		});

		return result;
	} catch (error) {
		throw error;
	}
};

// Lấy ra các học sinh chính sách
export const getPolicyBeneficiary = async (page: number, limit: number) => {
	return await StudentModel.paginate(
		{ dropoutDate: null, transferSchool: null, isPolicyBeneficiary: true },
		{ page: page, limit: limit, select: '-absentDays', sort: { class: 'desc' } }
	);
};

// Lấy ra tất cả các học sinh vắng mặt điểm danh
export const getAttendanceAllClass = async (page: number, limit: number, date: Date) => {
	try {
		const nextDay = new Date(date);
		nextDay.setDate(date.getDate() + 1);

		// học sinh vắng mặt của toàn trường trong ngày
		const studentAbsentDays = await StudentModel.paginate(
			{
				absentDays: {
					$elemMatch: {
						date: {
							$gte: date,
							$lt: nextDay,
						},
					},
				},
			},
			{
				lean: true,
				page: page,
				limit: limit,
				sort: { class: 'desc' },
				populate: { path: 'class', select: 'className' },
			}
		);

		// lấy ra tất cả các class hiện tại của trường
		const classes = await ClassModel.find({}).sort({ grade: 'asc' }).lean().select('className');

		return {
			...studentAbsentDays,
			classes,
		};
	} catch (error) {
		throw error;
	}
};
