import mongooseAutoPopulate from "mongoose-autopopulate";
import mongoose from "mongoose";

export interface SchoolYear extends Document {
    _id: string;
    startAt: number;
    endAt: number;
}

const SchoolYearSchema = new mongoose.Schema<SchoolYear>({
    startAt: {
        type: Number,
        default: new Date().getFullYear(),
    },
    endAt: String,
});

SchoolYearSchema.pre("save", function () {
    this.endAt = this.startAt + 1;
});

SchoolYearSchema.plugin(mongooseAutoPopulate);

export default mongoose.model<SchoolYear>("SchoolYears", SchoolYearSchema);
