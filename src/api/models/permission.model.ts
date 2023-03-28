import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { Model, ObjectId } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete';

type PermissionsType = Array<{
	_id: ObjectId;
	name: string;
	code: string;
}>;
export interface Permission extends Document {
	_id: ObjectId;
	role: string;
	type: string;
	permissions: PermissionsType;
}

interface PermissionDocument extends Omit<SoftDeleteDocument, '_id'>, Permission { }

interface PermissionModel extends Model<PermissionDocument> { }

interface SoftDeletePermissionModel extends SoftDeleteModel<PermissionDocument, PermissionModel> { }

const PermissionSchema = new mongoose.Schema<Permission>({
	_id: {
		type: mongoose.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
	},
	role: {
		type: String,
		require: true,
		trim: true,
		uppercase: true,
		enum: ['ADMIN', 'HEADMASTER', 'TEACHER', 'PARENTS'],
	},
	type: {
		type: String,
		require: true,
		trim: true,
	},
	permissions: [
		{
			_id: {
				type: mongoose.Types.ObjectId,
				default: new mongoose.Types.ObjectId(),
			},
			name: {
				type: String,
				require: true,
			},
			code: {
				type: String,
				unique: true,
				require: true,
			},
		},
	],
});

PermissionSchema.plugin(mongooseAutoPopulate);
PermissionSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true })

const PermissionModel: SoftDeletePermissionModel = mongoose.model<Permission, SoftDeletePermissionModel>('Permissions', PermissionSchema);

export default PermissionModel;
