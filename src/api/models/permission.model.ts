import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { ObjectId } from 'mongoose';

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

const PermissionSchema = new mongoose.Schema<Permission>({
	_id: {
		type: mongoose.Types.ObjectId,
		default: new mongoose.Types.ObjectId(),
	},
	role: {
		type: String,
		require: true,
		trim: true,
		//extra requirements if needed
	},
	type: {
		type: String,
		require: true,
		trim: true,
		//extra requirements if needed
	},
	// Thiếu field permissions !
});

PermissionSchema.plugin(mongooseAutoPopulate);

const PermissionModel = mongoose.model<Permission>('Permissions', PermissionSchema);

export default PermissionModel;
