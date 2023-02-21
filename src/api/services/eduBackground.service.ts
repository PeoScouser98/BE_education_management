import EduBackgroundModel, { EduBackground } from "../models/eduBackground.model";

export const getAll = async () => await EduBackgroundModel.find().exec();

export const create = async (data: EduBackground) => {
    const newEduBackground = new EduBackgroundModel(data);
    await newEduBackground.save();
    return newEduBackground;
};

export const edit = async (data: EduBackground, eduBackgroundId: String) => await EduBackgroundModel.findByIdAndUpdate(eduBackgroundId, data, { new: true });

export const remove = async (eduBackgroundId: String) => await EduBackgroundModel.findByIdAndDelete(eduBackgroundId);

// export const sortRemove = async (eduBackgroundId: String) =>
//     await eduBackgroundModel.delete(eduBackgroundId);
