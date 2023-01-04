import { SchoolYear } from "../../types/schemas.interface";
import mongoose from "mongoose";

const schoolYearSchema = new mongoose.Schema<SchoolYear>({
	startAt: {
		type: Number,
		default: new Date().getFullYear(),
	},
	endAt: String,
});

schoolYearSchema.pre("save", function () {
	this.endAt = this.startAt + 1;
});

export default mongoose.model("SchoolYears", schoolYearSchema);
