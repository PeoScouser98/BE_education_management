import { Student } from "../interfaces/student.interface";
import StudentModel from "../models/student.model";

export const getAll = async () => await StudentModel.find().exec();

export const createStudent = async (data: Student) => await new StudentModel(data);
