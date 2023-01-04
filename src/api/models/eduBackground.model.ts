import mongoose from "mongoose";
import { EduBackground } from "../../types/schemas.interface";

const eduBackgroundSchema = new mongoose.Schema<EduBackground>({
	level: {
		type: String,
		required: true,
	},
});

export default mongoose.model("EduBackgrounds", eduBackgroundSchema);
