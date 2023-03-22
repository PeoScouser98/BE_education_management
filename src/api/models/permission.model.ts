import mongooseAutoPopulate from "mongoose-autopopulate";
import mongoose, { ObjectId } from "mongoose";


type PermissionsType = Array<{
    _id: ObjectId,
    name: string,
    code: string,
}>
export interface Permission extends Document {
    _id: ObjectId;
    role: string;
    type: string;
    permissions: PermissionsType
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
        uppercase: true,
        enum: ['ADMIN', 'HEADMASTER', 'TEACHER', 'PARENTS'],
    },
    type: {
        type: String,
        require: true,
        trim: true,
    },
    permissions: [{
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
    }]
})

PermissionSchema.plugin(mongooseAutoPopulate);

const PermissionModel = mongoose.model<Permission>('Permissions', PermissionSchema);

export default PermissionModel;