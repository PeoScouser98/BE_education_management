import mongoose from "mongoose";
import { Teacher } from "../../types/schemas.interface";

const teacherSchema = new mongoose.Schema<Teacher>(
	{
		_id: mongoose.Types.ObjectId,
		email: {
			type: String,
			require: true,
			trim: true,
		},
		password: {
			type: String,
			require: true,
			default: "123@123",
			trim: true,
		},
		fullName: {
			type: String,
			require: true,
			trim: true,
		},
		phone: {
			type: String,
			require: true,
			minlength: 10,
			maxLength: 11,
		},
		dateOfBirth: {
			type: Date,
			require: true,
		},
		gender: {
			type: Boolean,
			require: true,
			default: true,
		},
		headClass: {
			type: mongoose.Types.ObjectId,
		},
		inChargeOfSpecialities: [
			{
				class: {
					type: mongoose.Types.ObjectId,
					ref: "Classes",
				},
				subject: [
					{
						type: mongoose.Types.ObjectId,
					},
				],
			},
		],
		position: {
			type: mongoose.Types.ObjectId,
		},
		eduBackground: {
			type: mongoose.Types.ObjectId,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("Teachers", teacherSchema);
