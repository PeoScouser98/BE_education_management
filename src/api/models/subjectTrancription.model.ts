import mongooseAutoPopulate from "mongoose-autopopulate";
import mongoose, { ObjectId } from "mongoose";

export interface SubjectTranscript extends Document {
    student: ObjectId;
    schoolYear: ObjectId;
    subject: ObjectId;
    firstSemester: {
        midtermTest?: {
            type: number;
            min: 0;
            max: 10;
        };
        finalTest: {
            type: number;
            min: 0;
            max: 10;
        };
    };
    secondSemester: {
        midtermTest?: {
            type: number;
            min: 0;
            max: 10;
        };
        finalTest: {
            type: number;
            min: 0;
            max: 10;
        };
    };
}

const SubjectTranscriptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Types.ObjectId,
        require: true,
        ref: "Students",
        autopopulate: { select: "fullName _id" },
    },
    schoolYear: {
        type: mongoose.Types.ObjectId,
        ref: "SchoolYears",
        autopopulate: true,
        require: true,
    },
    subject: {
        type: mongoose.Types.ObjectId,
        require: true,
        autopopulate: { select: "subjectName" },
    },
    firstSemester: {
        midtermTest: {
            type: Number,
            min: 0,
            max: 10,
        },
        finalTest: {
            type: Number,
            min: 0,
            max: 10,
        },
    },
    secondSemester: {
        midtermTest: {
            type: Number,
            min: 0,
            max: 10,
        },
        finalTest: {
            type: Number,
            min: 0,
            max: 10,
        },
    },
});
SubjectTranscriptSchema.plugin(mongooseAutoPopulate);

const SubjectTranscriptionModel = mongoose.model<SubjectTranscript>("SubjectTranscriptions", SubjectTranscriptSchema);

export default SubjectTranscriptionModel;
