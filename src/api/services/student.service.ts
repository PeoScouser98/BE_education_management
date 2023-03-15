import { MongooseError } from 'mongoose';
import StudentModel, { Student } from '../models/student.model';

// list students group by class
export const getStudentsByClass = async (classId: string) => {
	try {
		await StudentModel.find({ class: classId }).exec();
	} catch (error) {
		return error as MongooseError;
	}
};

// create new student using form
export const createStudent = async (data: Student) => {
	try {
		await new StudentModel(data).save();
	} catch (error) {
		return error as MongooseError;
	}
};

// get single student
export const getStudent = async (studentId: string) => {
	try {
		return await StudentModel.findOne({ _id: studentId }).exec();
	} catch (error) {
		return error as MongooseError;
	}
};

// import students from excel
export const importNewStudents = async (data: Array<Student>) => {
	try {
		return await StudentModel.insertMany(data);
	} catch (error) {
		return error as MongooseError;
	}
};

export const updateStudent = async (student: Student & Partial<Student> & Pick<Student, '_id'>) => {
	try {
		await StudentModel.findOneAndUpdate({ _id: student._id }, student, { new: true }).exec();
	} catch (error) {
		return error as MongooseError;
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
