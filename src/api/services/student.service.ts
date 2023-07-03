import createHttpError from 'http-errors';
import mongoose, { ObjectId, isValidObjectId } from 'mongoose';
import { HttpStatusCode } from '../../configs/statusCode.config';
import { compareDates } from '../../helpers/toolkit';
import { IAttendance, IStudent, StudentStatusEnum } from '../../types/student.type';
import { IUser } from '../../types/user.type';
import ClassModel from '../models/class.model';
import SchoolYearModel from '../models/schoolYear.model';
import StudentModel from '../models/student.model';
import {
	validateAttendanceStudent,
	validateReqBodyStudent,
	validateUpdateReqBodyStudent
} from '../validations/student.validation';
import { getCurrentSchoolYear } from './schoolYear.service';
import { deactivateParentsUser } from './user.service';

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
export const getStudentByClass = async (classId: string) => {
	const [currentSchoolYear] = await SchoolYearModel.find().sort({ endAt: -1 });
	if (!currentSchoolYear)
		return await StudentModel.find({
			class: classId,
			dropoutDate: null,
			transferSchool: null
		});

	return await StudentModel.aggregate()
		.match({
			class: new mongoose.Types.ObjectId(classId),
			dropoutDate: null,
			transferSchool: null
		})
		.lookup({
			from: 'users',
			localField: 'parents',
			foreignField: '_id',
			as: 'parents',
			pipeline: [
				{
					$project: {
						_id: 1,
						email: 1,
						displayName: 1
					}
				}
			]
		})
		.unwind('$parents')
		.lookup({
			from: 'student_remarks',
			localField: '_id',
			let: { studentId: '$_id' },
			foreignField: 'student',
			as: 'remarkAsQualified',
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{
									$eq: ['$student', '$$studentId']
								},
								{
									$eq: ['$schoolYear', currentSchoolYear._id]
								}
							]
						}
					}
				},
				{
					$project: {
						_id: 0,
						isQualified: 1
					}
				}
			]
		})
		.unwind('$remarkAsQualified')
		.lookup({
			from: 'subject_transcriptions',
			localField: '_id',
			let: { studentId: '$_id' },
			foreignField: 'student',
			as: 'completedProgram',
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [
								{ $eq: ['$student', '$$studentId'] },
								{
									$eq: ['$schoolYear', currentSchoolYear._id]
								}
							]
						}
					}
				}
			]
		})
		.lookup({
			from: 'classes',
			localField: 'class',
			foreignField: '_id',
			as: 'class',
			pipeline: [{ $project: { grade: 1, className: 1 } }]
		})
		.unwind('$class')
		.addFields({
			completedProgram: {
				$cond: {
					if: {
						$or: [
							{
								$and: [
									{ $in: ['$class.grade', [1, 2]] },
									{ $eq: [{ $size: '$completedProgram' }, 9] },
									{
										$eq: [
											{
												$size: {
													$filter: {
														input: '$completedProgram',
														as: 'item',
														cond: { $eq: ['$$item.isPassed', true] }
													}
												}
											},
											9
										]
									}
								]
							},
							{
								$and: [
									{ $in: ['$class.grade', [3, 4, 5]] },
									{ $eq: [{ $size: '$completedProgram' }, 11] },
									{
										$eq: [
											{
												$size: {
													$filter: {
														input: '$completedProgram',
														as: 'item',
														cond: { $eq: ['$$item.isPassed', true] }
													}
												}
											},
											11
										]
									}
								]
							}
						]
					},
					then: true,
					else: false
				}
			},
			remarkAsQualified: '$remarkAsQualified.isQualified'
		})
		.addFields({
			isGraduated: {
				$cond: {
					if: {
						$and: [
							{ $eq: ['$remarkAsQualified', true] },
							{ $eq: ['$completedProgram', true] },
							{ $eq: ['$class.grade', 5] }
						]
					},
					then: true,
					else: false
				}
			}
		});
};

// get detail student
export const getDetailStudent = async (id: string) => {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('Invalid student ID!');
	}

	const student: IStudent | null = await StudentModel.findOne({
		_id: id
	})
		.populate({
			path: 'class',
			select: 'className headTeacher'
		})
		.populate({ path: 'remarkOfHeadTeacher' });

	if (!student) {
		throw createHttpError.NotFound('Student does not exist!');
	}

	return student;
};

// h/s chuyển trường
export const setStudentTransferSchool = async (id: string, date: string) => {
	if (!id || !isValidObjectId(id)) throw createHttpError.BadRequest('Invalid student ID');
	const dateCheck = new Date(date);
	if (isNaN(dateCheck.getTime()))
		throw createHttpError.BadRequest('The Date you passed is not in the correct Date data type');
	// check xem có còn học ở trường không
	const student = await StudentModel.findOne({
		_id: id,
		transferSchool: null,
		dropoutDate: null
	});
	if (!student) {
		throw createHttpError.NotFound('The student has transferred to another school or dropped out');
	}
	const parentsOfStudent = student.parents as unknown as Pick<IUser, '_id' | 'email'>;
	if (parentsOfStudent) await deactivateParentsUser(parentsOfStudent);
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
		throw createHttpError.NotFound('Student has transferred to another school or dropped out');
	}
	await deactivateParentsUser(student.parents as unknown as Pick<IUser, '_id' | 'email'>);
	return await StudentModel.findOneAndUpdate({ _id: id }, { dropoutDate: date }, { new: true });
};

// Lấy ra các học sinh đã chuyển trường
export const getStudentTransferSchool = async (year: number | 'all', page: number, limit: number) => {
	const filter =
		year === 'all'
			? { transferSchool: { $ne: null } }
			: {
					$expr: { $eq: [{ $year: '$transferSchool' }, year] }
			  };
	return await StudentModel.paginate(filter, {
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
export const markAttendanceStudent = async (classId: string, absentStudents: IAbsentStudent[]) => {
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
		class: classId
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
export const dailyAttendanceList = async (classId: string, date: Date) => {
	if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
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
		class: classId
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
	const { absentDays } = await getDetailStudent(id);

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

export const promoteStudentsByClass = async (classId: string) => {
	const studentsInClass = await getStudentByClass(classId);
	const promotedStudents = studentsInClass.filter((student) => student.remarkAsQualified && student.completedProgram);
	if (promotedStudents.every((student) => student.class?.grade === 5)) {
		const graduatedStudents = await StudentModel.updateMany(
			{
				_id: promotedStudents
			},
			{ status: StudentStatusEnum.GRADUATED },
			{ new: true }
		);
		await deactivateParentsUser(promotedStudents.map((student) => student.parents));
		return graduatedStudents;
	}
	return promotedStudents;
};

export const getStudentsByParents = async (parentsId: string | ObjectId) =>
	await StudentModel.find({ parents: parentsId })
		.populate({
			path: 'class',
			select: '_id className headTeacher grade',
			options: { lean: true },
			populate: {
				path: 'headTeacher',
				select: 'displayName phone email'
			}
		})
		.select('-parents -createdAt -updatedAt');
