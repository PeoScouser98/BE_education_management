import { Model, ObjectId } from 'mongoose';
import { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

export type IPermissionsType = Array<{
	_id: ObjectId;
	name: string;
	code: string;
}>;
export interface Permission extends Document {
	_id: ObjectId;
	role: string;
	type: string;
	permissions: IPermissionsType;
}

export interface IPermissionDocument extends Omit<SoftDeleteDocument, '_id'>, Permission {}

export type IPermissionModel = Model<IPermissionDocument>;

export type ISoftDeletePermissionModel = SoftDeleteModel<IPermissionDocument, IPermissionModel>;
