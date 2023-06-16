import { ITimeTable } from '../../types/timeTable.type';
import { IUser } from '../../types/user.type';
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
	payload
}: {
	classId: string;
	payload: Pick<ITimeTable, 'class' | 'schedule'>;
}) => {
	try {
		return await TimeTableModel.findOneAndUpdate({ class: classId }, payload, {
			new: true
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
		const data = await TimeTableModel.findOne({ class: classId });
		return data;
	} catch (error) {
		throw error;
	}
};

export const getTeacherTimeTable = async (teacherId: string) => {
	const teacherTimetable = await TimeTableModel.find({
		$or: [
			{
				'schedule.monday': { $elemMatch: { teacher: teacherId } },
				'schedule.tuesday': { $elemMatch: { teacher: teacherId } },
				'schedule.wednesday': { $elemMatch: { teacher: teacherId } },
				'schedule.thursday': { $elemMatch: { teacher: teacherId } },
				'schedule.friday': { $elemMatch: { teacher: teacherId } },
				'schedule.saturday': { $elemMatch: { teacher: teacherId } }
			}
		]
	}).transform((docs) => {
		const result = docs.map((doc) => {
			const scheduleEachClass = Object.entries(doc.schedule)
				.map((d) => {
					const dayOfWeek = d[0];
					const periods = d[1];
					return periods
						.map((p) => {
							p = p.toObject();
							return {
								...p,
								dayOfWeek
							};
						})
						.filter((p) => (p.teacher as Partial<IUser>)?._id?.toString() === teacherId);
				})
				.flat();
			return { class: doc.class, schedule: scheduleEachClass };
		});

		return result;
	});
	return teacherTimetable;
};
