import mongoose from "mongoose";
import { Student } from "../../types/schemas.interface";

const studentSchema = new mongoose.Schema<Student>({
	_id: {
		type: mongoose.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
	},
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
	},
	class: {
		type: mongoose.Types.ObjectId,
		ref: "Classes",
	},
	schoolYear: {
		type: mongoose.Types.ObjectId,
		ref: "SchoolYear",
	},
	parentPhoneNumber: {
		type: String,
		require: true,
	},
	absents: [
		{
			date: {
				type: Date,
				default: new Date(),
			},

			hasPermision: { type: Boolean, default: false },
			reason: {
				type: String,
				minlength: 8,
				maxLength: 256,
				default: "Không có lý do",
			},
		},
	],
});
studentSchema.set("autoIndex", true);

export default mongoose.model("Students", studentSchema);
