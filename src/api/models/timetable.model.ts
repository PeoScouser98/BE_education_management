import mongoose, { ObjectId } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";
import { Subject } from "./subject.model";
import { Teacher } from "./teacher.model";

export interface Timetable {
    class: ObjectId;
    dayOfWeek: string;
    morning: Array<{
        subject: ObjectId | Pick<Subject, "subjectName" & "_id">;
        teacher: ObjectId | Pick<Teacher, "teacherName" & "_id">;
        period: number;
    }>;
    afternoon: Array<{
        subject: ObjectId | Pick<Subject, "subjectName" & "_id">;
        teacher: ObjectId | Pick<Teacher, "teacherName" & "_id">;
        period: number;
    }>;
}

const TimetableSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    dayOfWeek: {
        type: String,
        enum: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
        required: true,
    },
    morning: [
        {
            subject: {
                type: mongoose.Types.ObjectId,
                ref: "Subjects",
                autopopulate: { select: "subjectName" },
                required: true,
            },
            teacher: {
                type: mongoose.Types.ObjectId,
                ref: "Teachers",
                autopopulate: { select: "fullName _id" },
                required: true,
            },
            period: {
                type: Number,
                enum: [1, 2, 3, 4, 5],
                required: true,
            },
        },
    ],
    afternoon: [
        {
            subject: {
                type: String,
                required: true,
            },
            teacher: {
                type: mongoose.Types.ObjectId,
                ref: "Teachers",
                required: true,
                autopopulate: { select: "fullName _id" },
            },
            period: {
                type: Number,
                enum: [1, 2, 3, 4, 5],
                required: true,
            },
        },
    ],
});

TimetableSchema.plugin(mongooseAutoPopulate);

const TimetableModel = mongoose.model("Timetables", TimetableSchema);

export default TimetableModel;
