import { Student } from "../../types/schemas.interface";
import { MongooseError } from "mongoose";
import StudentModel from "../models/student.model";

export const getStudentsByClass = async (classId: string) => {
	try {
		await StudentModel.find({ class: classId }).exec();
	} catch (error) {
		return error;
	}
};

export const createStudent = async (data: Student) => await new StudentModel(data);

export const updateStudent = async (student: Student & Partial<Student> & Pick<Student, "_id">) => {
	try {
		await StudentModel.findOneAndUpdate({ _id: student._id }, student, { new: true }).exec();
	} catch (error) {
		return error;
	}
};

// export const updateMultiStudents = async (student:[Partial<Student>]) => {
// 	try {
//         await Promise.all(StudentModel.findOneAndUpdate({_id:}))
// 		// handle logic ...
// 	} catch (error) {
//         return error
// 	}
// };
