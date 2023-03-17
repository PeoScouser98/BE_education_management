import mongooseAutoPopulate from "mongoose-autopopulate";
import mongoose, { ObjectId } from 'mongoose';

export interface Permission extends Document {
    _id: ObjectId;
    role: string;
    type: string;
}

const PermissionSchema = new mongoose.Schema<Permission>({
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

const PermissionModel = mongoose.model<Permission>('Permissions', PermissionSchema);

export default PermissionModel;