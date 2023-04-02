import { ObjectId } from 'mongoose';
import { ISubject } from './subject.type';
import { IUser } from '../api/models/user.model';

export interface ITimetable {
	class: ObjectId;
	dayOfWeek: number;
	period: number;
	subject: ISubject;
	teacher: Pick<IUser, '_id'>;
}
