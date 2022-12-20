import { Schema, model, Types } from "mongoose";
import { Student } from "../interfaces/student.interface";
const studentSchema = new Schema<Student>({
	fullName: {
		type: String,
		require: true,
	},
	gender: {
		type: Boolean,
		require: true,
	},
	dateOfBirth: {
		type: Date,
		require: true,
		default: new Date(),
	},
	class: {
		type: Types.ObjectId,
		ref: "Classes",
	},
	schoolYear: {
		type: String,
		require: true,
	},
	parentPhoneNumber: {
		type: String,
		require: true,
	},
});

const Student = model("Students", studentSchema);

export default Student;
