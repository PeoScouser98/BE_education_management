import mongoose from "mongoose";
import { Student } from "../interfaces/student.interface";
const studentSchema = new mongoose.Schema<Student>({
	fullName: {
		type: String,
		require: true,
		trim: true,
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
	attendance: [
		{
			date: {
				type: Date,
				default: new Date(),
			},
			isPresent: {
				type: Boolean,
				require: true,
			},
			hasPermision: Boolean,
			reason: String,
		},
	],
});

studentSchema.statics.resetAttandanceEveryMonth = function () {};

export default mongoose.model("Students", studentSchema);
