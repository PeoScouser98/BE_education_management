import mongoose from "mongoose";
import { Class } from "../../types/schemas.interface";

const classSchema = new mongoose.Schema<Class>({
	className: {
		type: String,
		require: true,
		trim: true,
		uppercase: true,
	},
	grade: {
		type: String,
		enum: ["1", "2", "3", "4", "5"],
		require: true,
	},
	headTeacher: {
		type: mongoose.Types.ObjectId,
		ref: "Teachers",
	},
});

export default mongoose.model("Classes", classSchema);
