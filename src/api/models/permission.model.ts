import mongooseAutoPopulate from "mongoose-autopopulate";
import mongoose, { ObjectId } from 'mongoose';


type PermissionsType = Array<{
    _id: ObjectId,
    name: string,
    code: string,
}>
export interface IPermission extends Document {
    _id: ObjectId;
    role: string;
    type: string;
    permissions: PermissionsType
}

const PermissionSchema = new mongoose.Schema<IPermission>({
    _id: {
        type: mongoose.Types.ObjectId,
        default: new mongoose.Types.ObjectId(),
    },
    role: {
        type: String,
        require: true,
        //extra requirements if needed
    },
    type: {
        type: String,
        require: true,
        //extra requirements if needed
    },
})

PermissionSchema.plugin(mongooseAutoPopulate);

const PermissionModel = mongoose.model<IPermission>('Permissions', PermissionSchema);

export default PermissionModel;