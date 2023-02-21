import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

export interface EduBackground extends Document {
    _id: mongoose.Types.ObjectId;
    level: string;
}

const eduBackgroundSchema = new mongoose.Schema<EduBackground>({
    level: {
        type: String,
        enum: ["Cao Đẳng", "Đại Học"],
        required: true,
    },
});

// add plugin
eduBackgroundSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

const EducationBackgroundModel = mongoose.model<EduBackground>("EduBackgrounds", eduBackgroundSchema);

export default EducationBackgroundModel;
