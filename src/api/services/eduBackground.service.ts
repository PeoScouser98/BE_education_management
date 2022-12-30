import {EduBackground} from '../interfaces/schemas.interface';
import eduBackgroundModel from '../models/eduBackground.model';

export const getAll = async () => await eduBackgroundModel.find().exec();

export const create = async (data: EduBackground) => {
    const newEduBackground = new eduBackgroundModel(data);
    await newEduBackground.save();
    return newEduBackground;
};

export const edit = async (data: EduBackground, eduBackgroundId: String) =>
    await eduBackgroundModel.findByIdAndUpdate(eduBackgroundId, data, {new: true});

export const remove = async (eduBackgroundId: String) =>
    await eduBackgroundModel.findByIdAndDelete(eduBackgroundId);

// export const sortRemove = async (eduBackgroundId: String) =>
//     await eduBackgroundModel.delete(eduBackgroundId);
