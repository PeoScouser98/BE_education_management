import createHttpError from 'http-errors'
import { ObjectId } from 'mongoose'
import { IStudentRemark } from '../../types/student.type'
import ClassModel from '../models/class.model'
import StudentRemarkModel from '../models/studentRemark.model'
import { validateNewStudentRemark } from '../validations/studentRemark.validation'
import { getCurrentSchoolYear } from './schoolYear.service'

export const createStudentRemarkEntireClass = async (
	data: Array<Omit<IStudentRemark, '_id'>>,
	headTeacherId: string | ObjectId,
	classId: string
) => {
	const currentSchoolYear = await getCurrentSchoolYear()
	const currentClass = await ClassModel.findOne({ _id: classId, headTeacher: headTeacherId })
	if (!currentClass) throw createHttpError.Forbidden('Only head teacher can remark conduct for this student !')
	const payload = data.map(
		(item) =>
			({
				...item,
				schoolYear: currentSchoolYear._id?.toString(),
				remarkedBy: headTeacherId
			} as Omit<IStudentRemark, '_id'>)
	)
	const { error, value } = validateNewStudentRemark(payload)
	if (error) throw createHttpError.BadRequest(error.message)
	const bulkWriteOptions = value.map((v: IStudentRemark) => ({
		updateOne: {
			filter: { student: v.student, schoolYear: currentSchoolYear },
			update: v,
			upsert: true
		}
	}))
	await StudentRemarkModel.bulkWrite(bulkWriteOptions)
	return { message: `Insert students's remark for this class successfully !` }
}
