import createHttpError from 'http-errors';
import { ObjectId, isValidObjectId } from 'mongoose';
import { IStudent } from '../../types/student.type';
import { ISubjectTranscript } from '../../types/subjectTranscription.type';
import ClassModel from '../models/class.model';
import StudentModel from '../models/student.model';
import SubjectModel from '../models/subject.model';
import SubjectTranscriptionModel from '../models/subjectTrancription.model';
import { validateSubjectTranscript, validateSubjectTranscriptOne } from '../validations/subjectTrancription.validation';
import { getCurrentSchoolYear } from './schoolYear.service';
import mongoose from 'mongoose';

// Nhập điểm nhiều học sinh 1 lúc / môn / lớp
export const newScoreList = async (
	subjectId: string,
	classId: string,
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>[]
) => {
	// check xem classId và subjectId đã đúng type chưa
	if (!isValidObjectId(classId) || !isValidObjectId(subjectId))
		throw createHttpError.BadRequest('classId or subjectId is not in the correct ObjectId format');

	if (!Array.isArray(data) || data.length === 0)
		throw createHttpError.BadRequest('Body data must be an array and cannot be empty!');

	const [schoolYear, existedClass, existedSubject, isAllStudentInClass] = await Promise.all([
		getCurrentSchoolYear(),
		ClassModel.exists({ _id: classId }),
		SubjectModel.exists({ _id: subjectId }),
		StudentModel.exists({
			$and: [{ _id: { $in: data.map((std) => std.student) } }, { class: classId }]
		})
	]);

	if (!existedClass) throw createHttpError.NotFound('Class does not exist or has been deleted!'); // check if class exists
	if (!existedSubject) throw createHttpError.NotFound('Subject does not exist or has been deleted!'); // check if subject exists
	if (!isAllStudentInClass) throw createHttpError.Conflict('Some students do not exist in this class !'); // check if all student are in class to request

	// validate bảng điểm của các student gửi lên
	const { error, value } = validateSubjectTranscript(data);
	if (error) throw createHttpError.BadRequest(error.message);

	const bulkWriteOption = value.map((item: ISubjectTranscript) => ({
		updateOne: {
			filter: {
				student: item.student,
				subject: subjectId,
				schoolYear: schoolYear
			},
			update: item,
			upsert: true
		}
	}));

	return await SubjectTranscriptionModel.bulkWrite(bulkWriteOption);
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

	// lấy ra bảng điểm của những học sinh đó
	const transcriptStudentList = await SubjectTranscriptionModel.find({
		student: { $in: listStudent },
		schoolYear: schoolYear._id,
		subject: subjectId
	})
		.populate({ path: 'student', select: '-absentDays' })
		.populate({ path: 'schoolYear', select: 'startAt endAt' })
		.select('-_id');

	return transcriptStudentList;
};

// lấy ra bảng điểm học sinh / tất cả môn
export const getStudentTranscript = async (id: string) => {
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

	const studentTranscript = await SubjectTranscriptionModel.aggregate()
		.match({
			student: new mongoose.Types.ObjectId(id),
			schoolYear: schoolYear._id
		})
		.lookup({
			from: 'students',
			localField: 'student',
			foreignField: '_id',
			as: 'student',
			pipeline: [
				{
					$project: {
						_id: 1,
						fullName: 1
					}
				}
			]
		})
		.unwind('$student')
		.lookup({
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subject',
			pipeline: [
				{
					$project: {
						_id: 1,
						subjectName: 1
					}
				}
			]
		})
		.unwind('$subject')
		.group({
			_id: '$student',
			student: { $first: '$student' },
			transcript: {
				$push: {
					subject: '$subject',
					firstSemester: '$firstSemester',
					secondSemester: '$secondSemester',
					isPassed: '$isPassed'
				}
			}
		})
		.project({
			_id: 0,
			subject: 1,
			transcript: 1,
			student: 1
		});

	return studentTranscript.at(0);
};

// lấy điểm tất cả học sinh / tất cả các môn / lớp
export const selectTranscriptAllSubjectByClass = async (classId: string | ObjectId, schoolYear: ObjectId) => {
	if (!isValidObjectId(classId)) throw createHttpError.BadRequest('Invalid class ID');

	// lấy ra tất cả học sinh của lớp
	const listStudent: IStudent[] = await StudentModel.find({
		class: classId,
		dropoutDate: null,
		transferSchool: null
	})
		.select('_id')
		.lean();

	// lấy ra bảng điểm
	const studentsTranscriptsByClass = await SubjectTranscriptionModel.aggregate()
		.match({
			student: { $in: listStudent.map((student) => student._id) },
			schoolYear: schoolYear
		})
		.lookup({
			from: 'subjects',
			foreignField: '_id',
			localField: 'subject',
			as: 'subject',
			pipeline: [
				{
					$project: {
						subjectName: 1
					}
				}
			]
		})
		.unwind('$subject')
		.lookup({
			from: 'students',
			foreignField: '_id',
			localField: 'student',
			as: 'student',
			pipeline: [
				{
					$project: {
						_id: 1,
						fullName: 1,
						class: 1
					}
				}
			]
		})
		.unwind('$student')
		.group({
			_id: '$student',
			student: { $first: '$student' },
			transcript: {
				$push: {
					subject: '$subject',
					firstSemester: '$firstSemester',
					secondSemester: '$secondSemester',
					isPassed: '$isPassed'
				}
			}
		})
		.sort({ student: 1 })
		.project({
			_id: 0,
			student: 1,
			transcript: 1
		});
	// .allowDiskUse(true);
	return studentsTranscriptsByClass;
};
