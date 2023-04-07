import { ObjectId } from 'mongoose';
import { ISubject } from './subject.type';
import { IUser } from './user.type';

export interface ITimetable {
	class: ObjectId;
	dayOfWeek: number;
	period: number;
	subject: ISubject;
	teacher: Pick<IUser, '_id'>;
}
