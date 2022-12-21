import mongoose from "mongoose";
import { Student } from "../interfaces/student.interface";
const studentSchema = new mongoose.Schema<Student>({
	fullName: {
		type: String,
		// require: true,
	},
	gender: {
		type: Boolean,
		// require: true,
	},
	dateOfBirth: {
		type: Date,
		// require: true,
		default: new Date(),
	},
	class: {
		type: mongoose.Types.ObjectId,
		ref: "Classes",
	},
	schoolYear: {
		type: String,
		// require: true,
	},
	parentPhoneNumber: {
		type: String,
		// require: true,
	},
});

const Student = mongoose.model("Students", studentSchema);
export default Student;
