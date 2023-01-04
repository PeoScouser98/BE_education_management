import mongoose from "mongoose";
import { Subject } from "../../types/schemas.interface";

const subjectSchema = new mongoose.Schema<Subject>({
	subjectName: String,
});

export default mongoose.model("Subjects", subjectSchema);
