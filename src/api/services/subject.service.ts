import subjectModel, { Subject } from '../models/subject.model';

export const getAllSubjects = async () => {
	try {
		return await subjectModel.find().exec();
	} catch (error) {
		return error;
	}
};

export const createNewSubject = async (subject: Partial<Subject>) => {
	try {
		return await new subjectModel(subject).save();
	} catch (error) {
		return error;
	}
};

export const updateSubject = async (id: string, subject: Partial<Subject>) => {
	try {
		return await subjectModel.findOneAndUpdate({ _id: id }, subject, { new: true }).exec();
	} catch (error) {
		return error;
	}
};

export const deleteSubject = async (id: string) => {
	try {
		return await subjectModel.findOneAndDelete({ _id: id }).exec();
	} catch (error) {
		return error;
	}
};
