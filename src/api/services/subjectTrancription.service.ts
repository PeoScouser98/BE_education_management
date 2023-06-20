import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import { IStudent } from '../../types/student.type';
import { ISubjectTranscript } from '../../types/subjectTranscription.type';
import ClassModel from '../models/class.model';
import StudentModel from '../models/student.model';
import SubjectModel from '../models/subject.model';
import SubjectTranscriptionModel from '../models/subjectTrancription.model';
import { validateSubjectTranscript, validateSubjectTranscriptOne } from '../validations/subjectTrancription.validation';
import { getCurrentSchoolYear } from './schoolYear.service';

// Nhập điểm nhiều học sinh 1 lúc / môn / lớp
export const newScoreList = async (
	subjectId: string,
	classId: string,
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>[]
) => {
	// check xem classId và subjectId đã đúng type chưa
	if (!isValidObjectId(classId) || !isValidObjectId(subjectId)) {
		throw createHttpError.BadRequest('classId or subjectId is not in the correct ObjectId format');
	}

	if (!Array.isArray(data)) {
		throw createHttpError.BadRequest('Body data must be an array');
	}

	if (data.length === 0) {
		throw createHttpError(304);
	}

	// lấy ra schoolYear của hiện tại
	const schoolYear = await getCurrentSchoolYear();

	// check xem môn học và class có tồn tại hay không
	const studentExistQuery = ClassModel.findOne({ _id: classId });
	const subjectExistQuery = SubjectModel.findOne({ _id: subjectId });

	const [studentExist, subjectExist] = await Promise.all([studentExistQuery, subjectExistQuery]);

	if (!studentExist) throw createHttpError.NotFound('Class does not exist or has been deleted!');
	if (!subjectExist) throw createHttpError.NotFound('Subject does not exist or has been deleted!');

	// validate bảng điểm của các student gửi lên
	const transcriptStudentErrorValidates: { id: string; message: string }[] = [];
	data.forEach((item) => {
		const { error } = validateSubjectTranscript(item);
		if (error) {
			transcriptStudentErrorValidates.push({
				id: item.student.toString(),
				message: error.message
			});
		}
	});

	if (transcriptStudentErrorValidates.length > 0) {
		throw createHttpError(400, 'Transcript students fails to meet validation criteria!', {
			error: transcriptStudentErrorValidates
		});
	}

	// check xem data gửi lên có phải học sinh lớp học không
	const notAClassStudent: { id: string }[] = [];
	const idStudentList = data.map((v) => v.student.toString());
	const students: IStudent[] = await StudentModel.find({
		_id: { $in: idStudentList },
		class: classId,
		transferSchool: null,
		dropoutDate: null
	})
		.select('fullName class')
		.lean();

	if (idStudentList.length > students.length) {
		idStudentList.forEach((idStudent) => {
			const check = students.find((student) => student._id.toString() === idStudent);
			if (!check) {
				notAClassStudent.push({ id: idStudent });
			}
		});

		throw createHttpError(404, 'Student do not exist in class!', {
			error: notAClassStudent
		});
	}

	// Nếu bảng điểm của học sinh chưa có thì tạo mới còn có rồi thì update
	// lọc ra các bảng điểm của môn đã tồn tại
	const transcriptNotExists: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>[] = [];
	const transcriptExists: ISubjectTranscript[] = await SubjectTranscriptionModel.find({
		student: { $in: idStudentList },
		subject: subjectId,
		schoolYear: schoolYear._id
	})
		.select('_id student')
		.lean();

	if (transcriptExists.length !== 0 && transcriptExists.length < data.length) {
		// trường hợp có tồn tại các học sinh chưa được tạo bảng điểm
		data.forEach((item) => {
			const check = transcriptExists.find((exist) => exist.student.toString() === item.student.toString());
			if (!check) {
				transcriptNotExists.push(item);
			}
		});

		// update
		const bulkUpdate: any = transcriptExists.map((item) => {
			return {
				updateOne: {
					filter: {
						student: item.student,
						subject: subjectId,
						schoolYear: schoolYear._id
					},
					update: data.find((dataItem) => dataItem.student.toString() === item.student.toString())
				}
			};
		});
		const updateQuery = SubjectTranscriptionModel.bulkWrite(bulkUpdate);

		// create
		const dataCreate = transcriptNotExists.map((item) => ({
			...item,
			subject: subjectId,
			schoolYear: schoolYear._id
		}));

		const createQuery = SubjectTranscriptionModel.insertMany(dataCreate);

		await Promise.all([updateQuery, createQuery]);
	} else if (transcriptExists.length !== 0 && transcriptExists.length === data.length) {
		// trường hợp tất cả học sinh đều đã có bảng điểm
		const bulkUpdate: any = data.map((item) => {
			return {
				updateOne: {
					filter: {
						student: item.student,
						subject: subjectId,
						schoolYear: schoolYear._id
					},
					update: item
				}
			};
		});

		await SubjectTranscriptionModel.bulkWrite(bulkUpdate);
	} else if (transcriptExists.length === 0) {
		// trường hợp các học sinh đều chưa có bảng điểm
		await SubjectTranscriptionModel.insertMany(
			(() => {
				return data.map((item) => ({
					...item,
					subject: subjectId,
					schoolYear: schoolYear._id
				}));
			})()
		);
	}

	return {
		message: `Successfully inputted scores for subject ${subjectExist.subjectName} in class ${studentExist.className}`
	};
};

// nhập điểm 1 học sinh / môn / lớp
export const newScore = async (
	subjectId: string,
	studentId: string,
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear' | 'student'>
) => {
	// check xem studentId và subjectId đã đúng type chưa
	if (!isValidObjectId(studentId) || !isValidObjectId(subjectId)) {
		throw createHttpError.BadRequest('studentId or subjectId is not in the correct ObjectId format');
	}

	if (!data || Object.keys(data).length === 0) {
		throw createHttpError(304);
	}

	// lấy ra schoolYear của hiện tại
	const schoolYear = await getCurrentSchoolYear();

	// check xem môn học và student có tồn tại hay không
	const studentExistQuery = StudentModel.findOne({ _id: studentId });
	const subjectExistQuery = SubjectModel.findOne({ _id: subjectId });

	const [studentExist, subjectExist] = await Promise.all([studentExistQuery, subjectExistQuery]);
	if (!studentExist) throw createHttpError.NotFound('Student does not exist or has been deleted!');
	if (!subjectExist) throw createHttpError.NotFound('Subject does not exist or has been deleted!');

	// validate
	const { error } = validateSubjectTranscriptOne(data);
	if (error) {
		throw createHttpError.BadRequest(error.message);
	}

	// check xem student đã có bảng điểm chưa
	const transcriptExists = await SubjectTranscriptionModel.findOne({
		student: studentId,
		subject: subjectId,
		schoolYear: schoolYear._id
	});

	if (transcriptExists) {
		// đã tồn tại (update lại)
		return await SubjectTranscriptionModel.findOneAndUpdate(
			{
				_id: transcriptExists._id
			},
			data,
			{
				new: true
			}
		);
	} else {
		// chưa tồn tại (tạo bảng điểm)
		return await new SubjectTranscriptionModel({
			...data,
			student: studentId,
			subject: subjectId,
			schoolYear: schoolYear._id
		}).save();
	}
};

// lấy bảng điểm học sinh / lớp / môn
export const selectSubjectTranscriptByClass = async (classId: string, subjectId: string) => {
	if (!classId || !subjectId || !isValidObjectId(classId) || !isValidObjectId(subjectId)) {
		throw createHttpError.BadRequest('classId or subjectId is not in the correct ObjectId format');
	}

	// lấy ra schoolYear hiện tại
	const schoolYear = await getCurrentSchoolYear();

	// lấy ra list học sinh của lớp
	const listStudent: IStudent[] = await StudentModel.find({
		class: classId,
		dropoutDate: null,
		transferSchool: null
	})
		.select('_id')
		.lean();

	const idStudentList = listStudent.map((student) => student._id);
	// lấy ra bảng điểm của những học sinh đó
	const transcriptStudentList = await SubjectTranscriptionModel.find({
		student: { $in: idStudentList },
		schoolYear: schoolYear._id,
		subject: subjectId
	});

	return transcriptStudentList;
};

// lấy ra bảng điểm học sinh / tất cả môn
export const selectTranscriptStudent = async (id: string) => {
	if (!id || !isValidObjectId(id)) {
		throw createHttpError.BadRequest('id student is not in the correct ObjectId format');
	}

	// check sự tồn tại của học sinh
	const student: IStudent | null = await StudentModel.findOne({
		_id: id,
		dropoutDate: null,
		transferSchool: null
	});

	if (!student) {
		throw createHttpError.NotFound('Student does not exist');
	}

	const schoolYear = await getCurrentSchoolYear();

	const transcriptStudent = await SubjectTranscriptionModel.find({
		student: id,
		schoolYear: schoolYear._id
	}).select('-student');

	return transcriptStudent;
};

// lấy điểm tất cả học sinh / tất cả các môn / lớp
export const selectTranscriptAllSubjectByClass = async (classId: string) => {
	try {
		if (isValidObjectId('classId')) {
			throw createHttpError.BadRequest('ClassId không phải type objectId. ClassId: ' + classId);
		}

		// lấy ra schoolYear hiện tại
		const schoolYear = await getCurrentSchoolYear();

		// lấy ra tất cả học sinh của lớp
		const listStudent: IStudent[] = await StudentModel.find({
			class: classId,
			dropoutDate: null,
			transferSchool: null
		})
			.select('_id')
			.lean();

		const idStudentList = listStudent.map((student) => student._id);

		// lấy ra bảng điểm
		const transcriptStudentList = await SubjectTranscriptionModel.find({
			student: { $in: idStudentList },
			schoolYear: schoolYear._id
		}).sort({ student: 1 });

		return transcriptStudentList;
	} catch (error) {
		throw error;
	}
};
