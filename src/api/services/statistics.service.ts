import createHttpError from 'http-errors'
import StudentModel from '../models/student.model'
import { IStudent } from '../../types/student.type'
import { IClass } from '../../types/class.type'
import SubjectModel from '../models/subject.model'
import { ISubject } from '../../types/subject.type'
import SubjectTranscriptionModel from '../models/subjectTrancription.model'
import { ISubjectTranscript } from '../../types/subjectTranscription.type'
import ClassModel from '../models/class.model'
import { ObjectId } from 'mongodb'

export const getStdPercentageByGrade = async () => {
	const allGrades = [1, 2, 3, 4, 5]
	const labels = ['Khối 1', 'Khối 2', 'Khối 3', 'Khối 4', 'Khối 5']
	const data = await Promise.all(
		allGrades.map(async (g) => {
			const aggregateResult = await StudentModel.aggregate([
				{ $lookup: { from: 'classes', localField: 'class', foreignField: '_id', as: 'class' } },
				{ $unwind: '$class' },
				{ $match: { 'class.grade': g } },
				{ $count: g.toString() }
			])
			return aggregateResult.at(0) ? aggregateResult.at(0)[g] : 0
		})
	)

	return {
		labels,
		datasets: [
			{
				label: 'Tỉ lệ học sinh giữa các khối',
				data: data,
				backgroundColor: [
					'rgba(16, 185, 129, 1)',
					'rgba(79, 70, 229, 1)',
					'rgba(25, 118, 210, 1)',
					'rgba(231, 31, 105, 1)',
					'rgba(248, 179, 26, 1)'
				],
				borderColor: [
					'rgba(16, 185, 129,0.8)',
					'rgba(79, 70, 229,0.8)',
					'rgba(25, 118, 210,0.8)',
					'rgba(231, 31, 105,0.8)',
					'rgba(248, 179, 26,0.8)'
				],
				borderWith: 1
			}
		]
	}
}

export const getGoodStudentByClass = async (classId: string) => {
	try {
		if (!classId) {
			throw createHttpError.BadRequest('Parameter classId là bắt buộc')
		}
		const students: IStudent[] = await StudentModel.find({ class: classId })

		if (!students || students.length === 0) {
			throw createHttpError.NotFound('Lớp học không có học sinh')
		}

		const grade = (students[0].class as IClass).grade
		const studentIds = students.map((student) => student._id)

		// lấy ra các bảng điểm của các học sinh
		const transcriptStudents: ISubjectTranscript[] = await SubjectTranscriptionModel.find({
			student: { $in: studentIds }
		})

		const transcriptStudentConvert = transcriptStudents
			.map((transcriptStudent) => {
				const studentCurrent = students.find((item) => String(item._id) === String(transcriptStudent.student))
				const subject = transcriptStudent.subject as ISubject

				if (subject.isElectiveSubject || !studentCurrent) {
					return undefined
				}

				// Môn tính bằng điểm
				if (subject.isMainSubject) {
					// Khối 1,2
					if (
						studentCurrent?.class &&
						typeof studentCurrent.class !== 'string' &&
						[1, 2].includes((studentCurrent.class as IClass).grade)
					) {
						const firstSemester = transcriptStudent?.firstSemester?.midtermTest
						const secondSemester = transcriptStudent?.secondSemester?.midtermTest

						if (!firstSemester || !secondSemester) {
							throw createHttpError(400, 'Học sinh chưa đủ điều kiện để đánh giá học lực')
						}

						return {
							mediumScore: (firstSemester + secondSemester) / 2,
							student: studentCurrent._id
						}
					}

					// Các khối còn lại
					const firstSemesterI = transcriptStudent?.firstSemester?.finalTest
					const firstSemesterII = transcriptStudent?.firstSemester?.midtermTest
					const secondSemesterI = transcriptStudent?.secondSemester?.finalTest
					const secondSemesterII = transcriptStudent?.secondSemester?.midtermTest

					if (!firstSemesterI || !secondSemesterI || !firstSemesterII || !secondSemesterII) {
						throw createHttpError(400, 'Học sinh chưa đủ điều kiện để đánh giá học lực')
					}

					return {
						mediumScore: ((firstSemesterI + firstSemesterII) / 2 + (secondSemesterI + secondSemesterII) / 2) / 2,
						student: studentCurrent._id
					}
				}

				// Môn tính bằng nhận sét
				return {
					isPassed: transcriptStudent.isPassed,
					student: studentCurrent._id
				}
			})
			.filter((item) => item !== undefined)

		let level1 = 0
		let level2 = 0
		let level3 = 0

		studentIds.forEach((studentId) => {
			const studentTranscript = transcriptStudentConvert.filter(
				(item) => String(item?.student) === studentId.toString()
			)

			studentTranscript.forEach((transcript) => {
				const mediumScore = transcript?.mediumScore
				const isPassed = transcript?.isPassed
				if (mediumScore && !isPassed && mediumScore < 5) {
					level3++
				}

				if (!mediumScore && !isPassed) {
					level3++
				}

				if (mediumScore && mediumScore >= 5 && mediumScore < 9) {
					level2++
				}

				if (mediumScore && mediumScore >= 9) {
					level1++
				}
			})
		})

		return {
			labels: ['Học sinh xuất sắc', 'Học sinh tiên tiến', 'Học sinh cần cố gắng'],
			datasets: [
				{
					label: 'Thống kê học lực học sinh',
					data: [level1, level2, level3],
					backgroundColor: [
						'rgba(26,50,71,1)',
						'rgba(81,112,129,1)',
						'rgba(168,168,168,1)',
						'rgba(97,155,184,1)',
						'rgba(31,105,142,1)'
					],
					borderColor: [],
					borderWith: 1
				}
			]
		}
	} catch (error) {
		throw error
	}
}

export const getPolicyBeneficiary = async () => {
	try {
		const classes: IClass[] = await ClassModel.find({}).select('_id className').sort({ grade: 'asc' })
		const allClassId = classes.map((classItem) => classItem._id)

		const data = await Promise.all(
			allClassId.map(async (classId) => {
				const policyStudent: IStudent[] = await StudentModel.find({
					class: classId,
					isPolicyBeneficiary: true
				})

				return policyStudent.length
			})
		)
		return {
			labels: classes.map((classItem) => classItem.className),
			data: data,
			backgroundColor: [
				'rgba(26,50,71,1)',
				'rgba(81,112,129,1)',
				'rgba(168,168,168,1)',
				'rgba(97,155,184,1)',
				'rgba(31,105,142,1)'
			],
			borderColor: [],
			borderWith: 1
		}
	} catch (error) {
		throw error
	}
}
