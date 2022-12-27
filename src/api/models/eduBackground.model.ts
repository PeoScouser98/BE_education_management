import mongoose from 'mongoose';
import {EduBackground} from '../interfaces/schemas.interface';

const eduBackgroundSchema = new mongoose.Schema<EduBackground>({
    level: {
        type: String,
        required: true,
    },
});

export default mongoose.model('EduBackgrounds', eduBackgroundSchema);
