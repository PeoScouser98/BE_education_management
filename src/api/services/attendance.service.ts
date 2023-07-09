import { AttendanceSessionEnum } from './../../types/attendance.type';
import createHttpError from 'http-errors';
import moment from 'moment';
import * as mongodb from 'mongodb';
import { IAttendance } from '../../types/attendance.type';
import AttendanceModel from '../models/attendance.model';
import StudentModel from '../models/student.model';
import { validateAttedancePayload } from '../validations/attendance.validation';
import mongoose, { isValidObjectId } from 'mongoose';

export const saveAttendanceByClass = async (payload: Array<Omit<IAttendance, '_id'>>) => {
	// validate
	const { error } = validateAttedancePayload(payload);
	if (error) throw createHttpError.BadRequest(error.message);
	const bulkWriteOption: mongodb.AnyBulkWriteOperation<Omit<IAttendance, '_id'>>[] = payload.map(
		(atd: Omit<IAttendance, '_id'>) => ({
			updateOne: {
				filter: {
					student: atd.student,
					session: atd.session,
					date: moment().format('YYYY-MM-DD')
				},
				update: atd,
				upsert: true
			}
		})
	);
	const result = await AttendanceModel.bulkWrite(bulkWriteOption);

	return { message: 'Save attendance successfully !' };
};

export const getAttendanceByClass = async (classId: string, date?: string) => {
	if (!!date && !moment(date).isValid()) throw createHttpError.BadRequest('Invalid date');
	const studentsByClass = await StudentModel.find({ class: classId }).distinct('_id');
	return await AttendanceModel.aggregate()
		.match({
			student: { $in: studentsByClass },
			date: moment(date).format('YYYY-MM-DD')
		})
		.lookup({
			from: 'students',
			localField: 'student',
			foreignField: '_id',
			as: 'student',
			pipeline: [
				{
					$project: {
						_id: 1,
						fullName: 1
					}
				}
			]
		})
		.unwind('$student')
		.group({
			_id: { student: '$student', date: '$date' },
			student: { $first: '$student' },
			date: { $first: '$date' },
			attendance: {
				$push: {
					k: {
						$cond: {
							if: { $eq: ['$session', AttendanceSessionEnum.MORNING] },
							then: 'morning',
							else: 'afternoon'
						}
					},
					v: {
						isPresent: '$isPresent',
						reason: '$reason'
					}
				}
			}
		})
		.addFields({
			attendance: { $arrayToObject: '$attendance' }
		})
		.project({
			_id: 0,
			student: 1,
			date: 1,
			attendance: 1,
			reason: 1
		})
		.sort({ createdAt: -1 });
};

export const studentAttendance = async (studentId: string, timeRangeOption?: { from: string; to: string }) => {
	if (!isValidObjectId(studentId)) throw createHttpError.BadRequest('Invalid student ID');
	let dateFilter;
	if (!!timeRangeOption)
		dateFilter = {
			$and: [{ date: { $gte: timeRangeOption.from } }, { date: { $lte: timeRangeOption.to } }]
		};
	else dateFilter = { date: moment().format('YYYY-MM-DD') };
	return await AttendanceModel.aggregate().match({
		student: new mongoose.Types.ObjectId(studentId),
		...dateFilter
	});
};

export const getTodayClassAttendanceBySession = async (classId: string, ss: string) => {
	const studentsByClass = await StudentModel.find({ class: classId }).distinct('_id');
	return await AttendanceModel.find({
		student: { $in: studentsByClass },
		date: moment().format('YYYY-MM-DD'),
		session: AttendanceSessionEnum[ss]
	});
};
