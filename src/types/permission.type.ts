import { Model, ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export enum PermissionActionsEnum {
	GET = 'GET',
	CREATE = 'CREATE',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
}
export interface IPermission extends Document {
	_id: ObjectId;
	role: string;
	type: string;
	permissions: Array<{
		type: string;
		allowedActions: Array<string>;
	}>;
}

export interface IPermissionDocument extends Omit<SoftDeleteDocument, '_id'>, IPermission {}

export type IPermissionModel = Model<IPermission>;

export type ISoftDeletePermissionModel = SoftDeleteModel<IPermissionDocument, IPermissionModel>;
