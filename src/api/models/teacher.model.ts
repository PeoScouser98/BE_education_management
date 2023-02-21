import mongooseAutoPopulate from "mongoose-autopopulate";
import mongoose, { ObjectId } from "mongoose";

export interface Teacher extends Document {
    _id: ObjectId;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    dateOfBirth: Date;
    gender: boolean;
    eduBackground: ObjectId;
}

const TeacherSchema = new mongoose.Schema<Teacher>(
    {
        _id: mongoose.Types.ObjectId,
        email: {
            type: String,
            require: true,
            trim: true,
            unique: true,
            validate: {
                validator: function (value: string) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value);
                },
                message: (props: any) => `${props.value} is not a valid email address!`,
            },
        },
        password: {
            type: String,
            require: true,
            trim: true,
            minlength: 6,
            maxLength: 16,
        },
        fullName: {
            type: String,
            require: true,
            trim: true,
        },
        phone: {
            type: String,
            require: true,
            minlength: 10,
            maxLength: 11,
        },
        dateOfBirth: {
            type: Date,
            require: true,
        },
        gender: {
            type: Boolean,
            require: true,
            default: true,
        },
        eduBackground: {
            type: String,
            autopopulate: { select: "level" },
        },
    },
    {
        timestamps: true,
    },
);

TeacherSchema.plugin(mongooseAutoPopulate);

const TeacherModel = mongoose.model<Teacher>("Teachers", TeacherSchema);

export default TeacherModel;
