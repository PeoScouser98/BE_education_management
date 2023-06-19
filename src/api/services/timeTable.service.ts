import { ITimeTable } from '../../types/timeTable.type';
import { IUser } from '../../types/user.type';
import TimeTableModel from '../models/timeTable.model';

export const createTimetable = async (payload: any) => await new TimeTableModel(payload).save();

export const updateTimetable = async ({
	classId,
	payload
}: {
	classId: string;
	payload: Pick<ITimeTable, 'class' | 'schedule'>;
}) => await TimeTableModel.findOneAndUpdate({ class: classId }, payload, { new: true });

export const deleteTimeTable = async (classId: string) => await TimeTableModel.findOneAndDelete({ class: classId });

export const getTimetableByClass = async (classId: string) => await TimeTableModel.findOne({ class: classId });

export const getTeacherTimeTableByClass = async (teacherId: string, classId: string) => {
	const result = await TimeTableModel.findOne({
		class: classId,
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
	}).transform((doc) => {
		if (doc)
			return Object.entries(doc?.schedule)
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
						.filter((p) => (p.teacher as Pick<IUser, '_id' | 'displayName'>)._id.toString() === teacherId);
				})
				.flat();
		return doc;
	});

	return result;
};
