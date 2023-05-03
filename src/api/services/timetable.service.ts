import mongoose from 'mongoose';
import { IScheduleSlotTime, ITimeTable } from '../../types/timeTable.type';
import TimeTableModel from '../models/timeTable.model';

export const createTimetable = async (payload: any) => {
	try {
		return await new TimeTableModel(payload).save();
	} catch (error) {
		throw error;
	}
};

export const updateTimetable = async ({
	classId,
	payload,
}: {
	classId: string;
	payload: Pick<ITimeTable, 'class' | 'schedule'>;
}) => {
	try {
		return await TimeTableModel.findOneAndUpdate({ class: classId }, payload, {
			new: true,
		});
	} catch (error) {
		throw error;
	}
};

export const deleteTimeTable = async (classId: string) => {
	try {
		return await TimeTableModel.findOneAndDelete({ class: classId });
	} catch (error) {
		throw error;
	}
};

export const getTimetableByClass = async (classId: string) => {
	try {
		return await TimeTableModel.findOne({ class: classId }).sort({ table: 1 });
	} catch (error) {
		throw error;
	}
};
