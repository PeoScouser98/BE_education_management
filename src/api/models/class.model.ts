import mongoose, { ObjectId } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

export interface Class extends Document {
    _id: ObjectId;
    grade: ObjectId;
    className: string;
    headTeacher: ObjectId;
    students: Array<ObjectId>;
}

const ClassSchema = new mongoose.Schema<Class>({
    className: {
        type: String,
        require: true,
        trim: true,
        uppercase: true,
    },
    grade: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        require: true,
    },
    headTeacher: {
        type: mongoose.Types.ObjectId,
        ref: "Teachers",
        autopopulate: { select: "_id fullName phone email" },
    },
    students: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Students",
            autopopulate: { select: "studentName" },
        },
    ],
});

const ClassModel = mongoose.model<Class>("Classes", ClassSchema);

export default ClassModel;
