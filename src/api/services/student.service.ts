import createHttpError from 'http-errors';
import mongoose, { SortOrder, isValidObjectId } from 'mongoose';
import { HttpStatusCode } from '../../configs/statusCode.config';
import { compareDates } from '../../helpers/toolkit';
import { IAttendance, IStudent } from '../../types/student.type';
import { ISubjectTranscript } from '../../types/subjectTranscription.type';
import ClassModel from '../models/class.model';
import StudentModel from '../models/student.model';
import {
	validateAttendanceStudent,
	validateReqBodyStudent,
	validateUpdateReqBodyStudent
} from '../validations/student.validation';
import { getCurrentSchoolYear } from './schoolYear.service';
import { selectTranscriptStudent } from './subjectTrancription.service';

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
	const { error } = validateReqBodyStudent(data);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}

	if (Array.isArray(data)) {
		const hasExistedStudent = await StudentModel.exists({ code: { $in: data.map((student) => student.code) } });
		if (hasExistedStudent) throw createHttpError(409, 'Some students already exists ');
		return await StudentModel.insertMany(data);
	}

	const hasExistedStudent = await StudentModel.exists({
		code: data.code
	});

	if (hasExistedStudent) {
		throw createHttpError(409, 'Student already exists ');
	}

	return await new StudentModel(data).save();
};

// update
export const updateStudent = async (id: string, data: Partial<Omit<IStudent, '_id' | 'code'>>) => {
	// validate
	const { error } = validateUpdateReqBodyStudent(data);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}
	const student = await StudentModel.exists({ _id: id });
	if (!student) {
		throw createHttpError.NotFound('Student does not exist!');
	}
	return await StudentModel.findOneAndUpdate({ _id: id }, data, { new: true });
};

// get student theo class
export const getStudentByClass = async (classId: string, order: SortOrder, groupBy: string, select: string) => {
	const sortableFields = [
		'code',
		'fullName',
		'gender',
		'dateOfBirth',
		'class',
		'parentsPhoneNumber',
		'isPolicyBeneficiary',
		'isGraduated'
	];

	if (!sortableFields.includes(groupBy)) {
		throw createHttpError.BadRequest(
			"_sort can only belong to ['code','fullName','gender','dateOfBirth','class','parentsPhoneNumber','isPolicyBeneficiary','isGraduated']"
		);
	}

	const result = await StudentModel.find({
		class: classId,
		dropoutDate: null,
		transferSchool: null
	})
		.sort({ [groupBy]: order })
		.select(select);

	return result;
};

// get detail student
export const getDetailStudent = async (id: string) => {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('_id of the student is invalid');
	}

	const student: IStudent | null = await StudentModel.findOne({
		_id: id
	}).populate({
		path: 'class',
		select: 'className headTeacher'
	});

	const transcriptStudent: ISubjectTranscript[] = await selectTranscriptStudent(id);

	if (!student) {
		throw createHttpError.NotFound('Student does not exist!');
	}

	return {
		info: student,
		transcript: transcriptStudent
	};
};

// h/s chuyển trường
export const setStudentTransferSchool = async (id: string, date: string) => {
	if (!id) {
		throw createHttpError.BadRequest('_id of the student is invalid');
	}

	const dateCheck = new Date(date);
	if (isNaN(dateCheck.getTime())) {
		throw createHttpError.BadRequest('The Date you passed is not in the correct Date data type');
	}

	// check xem có còn học ở trường không
	const student = await StudentModel.findOne({
		_id: id,
		transferSchool: null,
		dropoutDate: null
	});

	if (!student) {
		throw createHttpError.NotFound('The student has transferred to another school or dropped out');
	}
	return await StudentModel.findOneAndUpdate({ _id: id }, { transferSchool: date }, { new: true });
};

// hs nghỉ học
export const setDropoutStudent = async (id: string, date: string) => {
	if (!id) {
		throw createHttpError.BadRequest('_id of the student is invalid');
	}

	const dateCheck = new Date(date);
	if (isNaN(dateCheck.getTime())) {
		throw createHttpError.BadRequest('The Date you passed is not in the correct Date data type');
	}

	// check xem có còn học ở trường không
	const student = await StudentModel.findOne({
		_id: id,
		transferSchool: null,
		dropoutDate: null
	});

	if (!student) {
		throw createHttpError.NotFound('The student has transferred to another school or dropped out');
	}
	return await StudentModel.findOneAndUpdate({ _id: id }, { dropoutDate: date }, { new: true });
};

// Lấy ra các học sinh đã chuyển trường
export const getStudentTransferSchool = async (year: number | 'all', page: number, limit: number) => {
	let condition: any = {
		$expr: { $eq: [{ $year: '$transferSchool' }, year] }
	};
	if (year === 'all') {
		condition = { transferSchool: { $ne: null } };
	}

	return await StudentModel.paginate(condition, {
		page: page,
		limit: limit
	});
};

export const getStudentDropout = async (year: 'all' | number, page: number, limit: number) => {
	let condition: any = {
		$expr: { $eq: [{ $year: '$dropoutDate' }, year] }
	};

	if (year === 'all') {
		condition = { dropoutDate: { $ne: null } };
	}

	return await StudentModel.paginate(condition, {
		page: page,
		limit: limit
	});
};

// điểm danh
export const markAttendanceStudent = async (idClass: string, absentStudents: IAbsentStudent[]) => {
	if (!absentStudents) {
		throw createHttpError(HttpStatusCode.NO_CONTENT);
	}
	if (!Array.isArray(absentStudents)) {
		throw createHttpError(400, 'The list of absent students is not an array type');
	}
	if (absentStudents.length === 0) {
		return {
			message: 'Attendance has been saved!'
		};
	}

	// nếu data gửi lên là 1 học sinh đã điểm danh trong ngày rồi

	// validate học sinh nghỉ gửi lên
	const errorValidates: { id: string; message: string }[] = [];

	let message = '';
	absentStudents.forEach((item) => {
		if (!item.idStudent || !isValidObjectId(item.idStudent)) {
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
			error: errorValidates
		});
	}

	// Lấy ra các id học sinh nghỉ
	const absentStudentIdList: string[] = absentStudents.map((student) => student.idStudent);

	// Kiểm tra xem học sinh vắng có đúng học sinh của lớp không
	const checkExist: IStudent[] = await StudentModel.find({
		_id: { $in: absentStudentIdList },
		class: idClass
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
			error: studentNotExist
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
				name: student.fullName
			});
		}
	});

	if (attendedStudents.length > 0) {
		throw createHttpError(409, "Today's attendance for the student already exists", {
			error: attendedStudents
		});
	}

	// lấy ra học kỳ hiện tại
	const schoolYearCurr = await getCurrentSchoolYear();

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
							schoolYear: schoolYearCurr._id
						}
					}
				}
			}
		};
	});

	await StudentModel.bulkWrite(bulkUpdateAbsentStudents);

	return {
		message: 'Attendance has been saved!'
	};
};

// lấy ra tình trạng điểm danh của 1 lớp theo ngày
export const dailyAttendanceList = async (idClass: string, date: Date) => {
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
					$lt: nextDay
				}
			}
		},
		class: idClass
	}).lean();

	if (studentAbsents.length === 0) {
		return {
			absent: 0,
			students: []
		};
	}

	const result = studentAbsents.map((item) => {
		let attendanceStatus = true;
		const check = studentAbsents.find((itemAb) => itemAb._id.toString() === item._id.toString());

		attendanceStatus = check ? false : true;
		return {
			...item,
			attendanceStatus: attendanceStatus
		};
	});

	return {
		absent: studentAbsents.length,
		students: result
	};
};

// Lấy ra tình trạng điểm danh của 1 học sinh trong 1 tháng (sẽ trả về ngày vắng mặt trong tháng đấy)
export const attendanceOfStudentByMonth = async (id: string, month: number, year: number) => {
	const {
		info: { absentDays }
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
};

// Lấy ra các học sinh chính sách
export const getPolicyBeneficiary = async (page: number, limit: number) => {
	return await StudentModel.paginate(
		{ dropoutDate: null, transferSchool: null, isPolicyBeneficiary: true },
		{
			page: page,
			limit: limit,
			select: '-absentDays',
			sort: { class: 'desc' }
		}
	);
};

// Lấy ra tất cả các học sinh vắng mặt điểm danh
export const getAttendanceAllClass = async (page: number, limit: number, date: Date) => {
	const nextDay = new Date(date);
	nextDay.setDate(date.getDate() + 1);

	// học sinh vắng mặt của toàn trường trong ngày
	const studentAbsentDays = await StudentModel.paginate(
		{
			absentDays: {
				$elemMatch: {
					date: {
						$gte: date,
						$lt: nextDay
					}
				}
			}
		},
		{
			lean: true,
			page: page,
			limit: limit,
			sort: { class: 'desc' },
			populate: { path: 'class', select: 'className' }
		}
	);

	// lấy ra tất cả các class hiện tại của trường
	const classes = await ClassModel.find({}).sort({ grade: 'asc' }).lean().select('className');

	return {
		...studentAbsentDays,
		classes
	};
};
