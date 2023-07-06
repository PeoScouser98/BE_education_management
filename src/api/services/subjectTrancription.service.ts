import createHttpError from 'http-errors';
import mongoose, { ObjectId, isValidObjectId } from 'mongoose';
import { IClass } from '../../types/class.type';
import { IStudent } from '../../types/student.type';
import { ISubjectTranscript } from '../../types/subjectTranscription.type';
import ClassModel from '../models/class.model';
import StudentModel from '../models/student.model';
import SubjectModel from '../models/subject.model';
import SubjectTranscriptionModel from '../models/subjectTrancription.model';
import { validateSubjectTranscript } from '../validations/subjectTrancription.validation';
import { getCurrentSchoolYear, getLatestSchoolYear } from './schoolYear.service';

// Nhập điểm nhiều học sinh 1 lúc / môn / lớp
export const insertSubjectTranscriptByClass = async (
	subjectId: string,
	classId: string,
	data: Omit<ISubjectTranscript, '_id' | 'subject' | 'schoolYear'>[]
) => {
	if (!isValidObjectId(classId) || !isValidObjectId(subjectId))
		throw createHttpError.BadRequest(`Class's ID or subject's ID is invalid ObjectId`);

	if (!Array.isArray(data) || data.length === 0)
		throw createHttpError.BadRequest('Body data must be an array and cannot be empty!');

	const [currentSchoolYear, currentClass, currentSubject, isAllStudentInClass] = await Promise.all([
		getCurrentSchoolYear(),
		ClassModel.findOne({ _id: classId }),
		SubjectModel.findOne({ _id: subjectId }),
		StudentModel.exists({
			$and: [{ _id: { $in: data.map((std) => std.student) } }, { class: classId }]
		})
	]);
	if (!currentClass) throw createHttpError.NotFound('Class does not exist or has been deleted!');

	// Check if subject submit for transcript does exist
	if (!currentSubject) throw createHttpError.NotFound('Subject does not exist or has been deleted!');

	// Check tất cả học sinh trong bảng điểm gửi lên có nằm trong lớp
	if (!isAllStudentInClass) throw createHttpError.Conflict('Some students do not exist in this class !');

	// validate bảng điểm của các student gửi lên
	const { error, value } = validateSubjectTranscript(data, currentSubject, currentClass);
	if (error) throw createHttpError.BadRequest(error.message);

	const bulkWriteOption = value.map((item: ISubjectTranscript) => ({
		updateOne: {
			filter: {
				student: item.student,
				subject: subjectId,
				// schoolYear: currentSchoolYear
				schoolYear: '6493e4fc7b4f808ce2e4cdcb'
			},
			update: item,
			upsert: true
		}
	}));

	return await SubjectTranscriptionModel.bulkWrite(bulkWriteOption);
};

// lấy bảng điểm của tất học sinh trong 1 lớp theo môn học
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

// lấy ra bảng điểm 1 học sinh với tất cả môn
export const getStudentTranscript = async (id: string | ObjectId, schoolYear: string) => {
	if (!id || !isValidObjectId(id)) {
		throw createHttpError.BadRequest('Invalid student ID !');
	}

	const student: null | IStudent = await StudentModel.findOne({
		_id: id,
		dropoutDate: null,
		transferSchool: null
	}).populate({ path: 'class' });

	if (!student) {
		throw createHttpError.NotFound('Student does not exist');
	}

	const studentClass = student.class as Partial<IClass>;
	const studentGrade = studentClass?.grade!;
	const totalSubjectsOfTranscript = [1, 2].includes(studentGrade) ? 9 : 11;
	const validSchoolYearsOfStudentTranscripts = await getValidSchoolYearOfStudentTranscript(student._id.toString());
	if (!validSchoolYearsOfStudentTranscripts.map((s) => s.toString()).includes(schoolYear)) {
		throw createHttpError.BadRequest('Student does not has transcript in this school year!');
	}
	const latestSchoolYear = validSchoolYearsOfStudentTranscripts.at(0)._id;
	const studentTranscripts = await SubjectTranscriptionModel.aggregate()
		.match({
			student: student._id,
			schoolYear:
				!!schoolYear && isValidObjectId(schoolYear) ? new mongoose.Types.ObjectId(schoolYear) : latestSchoolYear
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
			schoolYear: { $first: '$schoolYear' },
			transcript: {
				$push: {
					subject: '$subject',
					firstSemester: '$firstSemester',
					secondSemester: '$secondSemester',
					isPassed: '$isPassed'
				}
			}
		})
		.addFields({
			completedProgram: {
				$and: [
					{ $eq: [{ $size: '$transcript' }, totalSubjectsOfTranscript] },
					{
						$eq: [
							{
								$setEquals: [
									{
										$map: {
											input: '$transcript',
											as: 'transcript',
											in: '$$transcript.isPassed'
										}
									},
									Array(totalSubjectsOfTranscript).fill(true)
								]
							},
							true
						]
					}
				]
			}
		})
		.project({
			_id: 0,
			transcript: 1,
			student: 1,
			schoolYear: 1,
			completedProgram: 1
		});

	return studentTranscripts;
};

// Lấy bảng điểm tất cả các môn của 1 lớp
export const getTranscriptsByClass = async (classId: string | ObjectId, schoolYear: ObjectId) => {
	if (!isValidObjectId(classId)) throw createHttpError.BadRequest('Invalid class ID');

	const [listStudent, [grade]] = await Promise.all([
		StudentModel.find({
			class: classId,
			dropoutDate: null,
			transferSchool: null
		}).distinct('_id'),
		ClassModel.findOne({ _id: classId }).distinct('grade')
	]);

	// Khối 1,2 chỉ có 9 môn, khối 3,4,5 có 11 môn
	const totalSubjectsOfTranscript = [1, 2].includes(grade) ? 9 : 11;

	const transcripts = await SubjectTranscriptionModel.aggregate()
		.match({
			student: { $in: listStudent },
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
					k: '$subject.subjectName',
					v: {
						firstSemester: '$firstSemester',
						secondSemester: '$secondSemester',
						isPassed: '$isPassed'
					}
				}
			}
		})
		.addFields({
			transcript: { $arrayToObject: '$transcript' },
			completedProgram: {
				$and: [
					{ $eq: [{ $size: '$transcript' }, totalSubjectsOfTranscript] },
					{
						$eq: [
							{
								$setEquals: [
									{
										$map: {
											input: '$transcript',
											as: 'transcript',
											in: '$$transcript.v.isPassed'
										}
									},
									Array(totalSubjectsOfTranscript).fill(true)
								]
							},
							true
						]
					}
				]
			}
		})

		.sort({ student: 1 })
		.project({
			_id: 0,
			student: 1,
			transcript: 1,
			completedProgram: 1
		});

	const transformedTranscripts = transcripts.map((doc) => {
		const { transcript, ...rest } = doc;
		return { ...rest, ...transcript };
	});
	return transformedTranscripts;
};

export const getValidSchoolYearOfStudentTranscript = async (studentId: string) => {
	return await SubjectTranscriptionModel.aggregate()
		.match({ student: new mongoose.Types.ObjectId(studentId) })
		.lookup({
			from: 'school_years', // replace with your SchoolYear collection name
			localField: 'schoolYear',
			foreignField: '_id',
			as: 'schoolYear'
		})
		.unwind('$schoolYear')
		.group({ _id: '$schoolYear' })
		.sort({ endAt: -1 });
};
