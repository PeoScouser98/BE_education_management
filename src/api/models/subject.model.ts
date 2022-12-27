import mongoose from "mongoose";
import { Subject } from "../interfaces/schemas.interface";

const subjectSchema = new mongoose.Schema<Subject>({
	subjectName: String,
});

export default mongoose.model("Subjects", subjectSchema);
