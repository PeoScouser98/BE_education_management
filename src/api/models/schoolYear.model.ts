import { SchoolYear } from "./../interfaces/schemas.interface";
import mongoose from "mongoose";

const schoolYearSchema = new mongoose.Schema<SchoolYear>({
	startAt: String,
	endAt: String,
});

export default mongoose.model("SchoolYears", schoolYearSchema);
