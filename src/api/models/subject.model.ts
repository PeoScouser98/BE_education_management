import mongoose, { ObjectId } from "mongoose";

export interface Subject extends Document {
    _id: ObjectId;
    subjectName: string;
}

const subjectSchema = new mongoose.Schema<Subject>({
    subjectName: String,
});

export default mongoose.model<Subject>("Subjects", subjectSchema);
