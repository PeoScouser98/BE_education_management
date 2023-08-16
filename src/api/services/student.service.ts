/* eslint-disable @typescript-eslint/no-unused-vars */
import createHttpError from 'http-errors'
import mongoose, { ObjectId, isValidObjectId } from 'mongoose'
import generatePictureByName from '../../helpers/generatePicture'
import { toCapitalize } from '../../helpers/toolkit'
import { IStudent, StudentStatusEnum } from '../../types/student.type'
import { IUser } from '../../types/user.type'
import ClassModel from '../models/class.model'
import SchoolYearModel from '../models/schoolYear.model'
import StudentModel from '../models/student.model'
import { validateReqBodyStudent, validateUpdateReqBodyStudent } from '../validations/student.validation'
import { deactivateParentsUser } from './user.service'

// create new student using form
export const createStudent = async (data: Omit<IStudent, '_id'> | Omit<IStudent, '_id'>[]) => {
	const { error } = validateReqBodyStudent(data)
	if (error) {
		throw createHttpError.BadRequest(error.message)
	}

	if (Array.isArray(data)) {
		const hasExistedStudent = await StudentModel.exists({ code: { $in: data.map((student) => student.code) } })
		if (hasExistedStudent) throw createHttpError(409, 'Some students already exists ')
		if (data.length > 35)
			throw createHttpError.UnprocessableEntity('Class size cannot be greater than 35 students each class !')
		return await StudentModel.insertMany(
			data.map((student) => ({ ...student, fullName: toCapitalize(student.fullName) }))
		)
	}

	const hasExistedStudent = await StudentModel.exists({
		code: data.code
	})

	if (hasExistedStudent) {
		throw createHttpError(409, 'Student already exists ')
	}

	return await new StudentModel(data).save()
}

// update
export const updateStudent = async (id: string, data: Partial<Omit<IStudent, '_id' | 'code'>>) => {
	// validate
	const { error } = validateUpdateReqBodyStudent(data)
	if (error) {
		throw createHttpError.BadRequest(error.message)
	}
	const student = await StudentModel.exists({ _id: id })
	if (!student) {
		throw createHttpError.NotFound('Student does not exist!')
	}
	return await StudentModel.findOneAndUpdate(
		{ _id: id },
		{ ...data, fullName: <string>toCapitalize(<string>data.fullName) },
		{ new: true }
	)
}

// get detail student
export const getDetailStudent = async (id: string) => {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw createHttpError.BadRequest('Invalid student ID!')
	}

	const student: IStudent | null = await StudentModel.findOne({
		_id: id
	})
		.populate({
			path: 'class',
			select: 'className headTeacher'
		})
		.populate({ path: 'remarkOfHeadTeacher' })

	if (!student) {
		throw createHttpError.NotFound('Student does not exist!')
	}

	return student
}

// h/s chuyển trường
export const setStudentTransferSchool = async (id: string, date: string) => {
	if (!id || !isValidObjectId(id)) throw createHttpError.BadRequest('Invalid student ID')
	const dateCheck = new Date(date)
	if (isNaN(dateCheck.getTime()))
		throw createHttpError.BadRequest('The Date you passed is not in the correct Date data type')
	// check xem có còn học ở trường không
	const student = await StudentModel.findOne({
		_id: id,
		transferSchoolDate: null,
		dropoutDate: null
	})
	if (!student) {
		throw createHttpError.NotFound('The student has transferred to another school or dropped out')
	}
	const parentsOfStudent = student.parents as unknown as Pick<IUser, '_id' | 'email'>
	if (parentsOfStudent) await deactivateParentsUser(parentsOfStudent)
	return await StudentModel.findOneAndUpdate(
		{ _id: id },
		{ transferSchoolDate: date, status: StudentStatusEnum.TRANSFER_SCHOOL, class: null },
		{ new: true }
	)
}

// hs nghỉ học
export const setDropoutStudent = async (id: string, date: string) => {
	if (!id) {
		throw createHttpError.BadRequest('_id of the student is invalid')
	}

	const dateCheck = new Date(date)
	if (isNaN(dateCheck.getTime())) {
		throw createHttpError.BadRequest('The Date you passed is not in the correct Date data type')
	}

	// check xem có còn học ở trường không
	const student = await StudentModel.findOne({
		_id: id,
		transferSchoolDate: null,
		dropoutDate: null
	})

	if (!student) {
		throw createHttpError.NotFound('Student has transferred to another school or dropped out')
	}
	await deactivateParentsUser(student.parents as unknown as Pick<IUser, '_id' | 'email'>)
	return await StudentModel.findOneAndUpdate(
		{ _id: id },
		{ dropoutDate: date, status: StudentStatusEnum.DROPPED_OUT, class: null },
		{ new: true }
	)
}

// Lấy ra các học sinh đã chuyển trường
export const getStudentTransferSchool = async () => {
	return await StudentModel.find({ transferSchoolDate: { $ne: null } })
}

export const getStudentDropout = async () => {
	return await StudentModel.find({ dropoutDate: { $ne: null } })
}

// Lấy ra các học sinh chính sách
export const getPolicyBeneficiary = async (page: number, limit: number) => {
	return await StudentModel.paginate(
		{ dropoutDate: null, transferSchoolDate: null, isPolicyBeneficiary: true },
		{
			page: page,
			limit: limit,
			select: '-absentDays',
			sort: { class: 'desc' }
		}
	)
}

export const getStudentsByClass = async (classId: string) => {
	const [currentSchoolYear] = await SchoolYearModel.find().sort({ endAt: -1 })
	return await StudentModel.aggregate()
		.match({
			class: new mongoose.Types.ObjectId(classId),
			dropoutDate: null,
			transferSchoolDate: null
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
						displayName: 1,
						phone: 1
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
		.unwind({
			path: '$remarkAsQualified',
			preserveNullAndEmptyArrays: true
		})
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
		.unwind({ path: '$class', preserveNullAndEmptyArrays: true })

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
														cond: {
															$or: [
																{ $eq: ['$$item.secondSemester.isPassed', true] },
																{ $gt: ['$$item.secondSemester.finalTest', 5] }
															]
														}
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
														cond: {
															$or: [
																{ $eq: ['$$item.secondSemester.isPassed', true] },
																{ $gt: ['$$item.secondSemester.finalTest', 5] }
															]
														}
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
			remarkAsQualified: { $ifNull: ['$remarkAsQualified.isQualified', false] },
			parents: '$parents'
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
		})
}

export const promoteStudentsByClass = async (classId: string) => {
	const [studentsInClass, currentClass] = await Promise.all([
		getStudentsByClass(classId),
		ClassModel.findOne({ _id: classId })
	])

	if (!currentClass) throw createHttpError.NotFound('Cannot find current class to promote student included in !')
	if (!studentsInClass.length) throw createHttpError.NotFound('No student can be promoted !')

	const promotedStudents = studentsInClass.filter(
		(student: IStudent & { remarkAsQualified: boolean; completedProgram: boolean }) =>
			student.remarkAsQualified && student.completedProgram
	)

	const canPromoteToGraduate = promotedStudents.every((student) => student.class?.grade === 5)

	if (canPromoteToGraduate) {
		const [graduatedStudents, _] = await Promise.all([
			StudentModel.updateMany(
				{
					_id: { $in: promotedStudents }
				},
				{ status: StudentStatusEnum.GRADUATED, class: null },
				{ new: true }
			),
			deactivateParentsUser(promotedStudents.map((student) => student.parents))
		])
		return { message: `${graduatedStudents.modifiedCount} students has been promoted.` }
	} else {
		/* Next class student can be transfered */
		const nextClassName = currentClass.className.slice(1)
		const nextClassStudentPossibleTransfer = await ClassModel.findOne({
			className: currentClass.grade + nextClassName
		})

		if (!nextClassStudentPossibleTransfer)
			throw createHttpError.UnprocessableEntity('Hiện chưa có lớp học phù hợp để hiện chuyển lớp')
		const { modifiedCount } = await StudentModel.updateMany(
			{
				_id: { $in: promotedStudents }
			},
			{
				class: nextClassStudentPossibleTransfer._id
			},
			{ new: true }
		)

		return { message: `${modifiedCount} students has been promoted.` }
	}
}

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
		.select('-parents -createdAt -updatedAt')
		.transform((students) =>
			students.map((std) => ({ ...std.toObject(), picture: generatePictureByName(std.fullName) }))
		)

export const getStudentsByHeadTeacherClass = async (headTeacherId: string) => {
	const classOfHeadTeacher = await ClassModel.findOne({ headTeacher: headTeacherId }).select('_id')
	if (!classOfHeadTeacher) throw createHttpError.NotFound('You have not play a role as a head teacher for any class !')
	return await getStudentsByClass(classOfHeadTeacher._id.toString())
}

export const getGraduatedStudents = async (page: number, limit: number, schoolYearId: string) => {
	return StudentModel.paginate(
		{
			status: StudentStatusEnum.GRADUATED,
			graduatedAt: schoolYearId
		},
		{
			limit: limit,
			page: page,
			sort: { graduatedAt: -1 }
		}
	)
}
