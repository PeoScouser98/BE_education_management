import bcrypt, { genSaltSync } from 'bcrypt';
import 'dotenv/config';
import mongoose from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import {
	ISoftDeleteUserModel,
	IUser,
	IUserDocument,
	UserGenderEnum,
	UserRoleEnum,
} from '../../types/user.type';

const UserSchema = new mongoose.Schema<IUser>(
	{
		email: {
			type: String,
			trim: true,
			unique: true,
		},
		phone: {
			type: String,
			require: true,
			unique: true,
		},
		displayName: {
			type: String,
			require: true,
			trim: true,
		},
		dateOfBirth: {
			type: Date,
			require: true,
		},
		gender: {
			type: String,
			require: true,
			lowercase: true,
			enum: UserGenderEnum,
		},
		picture: {
			type: String,
			trim: true,
			require: true,
		},

		eduBackground: {
			type: {
				qualification: String, // học vấn
				universityName: String, // tên trường đã tốt nghiệp
				graduatedAt: Date,
			},
			required: true,
		},
		employmentStatus: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			trim: true,
			enum: UserRoleEnum,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		versionKey: false,
	}
);

UserSchema.virtual('children', {
	localField: 'phone',
	foreignField: 'parentsPhoneNumber',
	ref: 'students',
});

UserSchema.methods.verifyPassword = function (password: string) {
	if (!password) return false;
	return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', function (next) {
	if (this.password) {
		this.password = bcrypt.hashSync(this.password, genSaltSync(+process.env.SALT_ROUND!));
	}
	next();
});

const UserModel = mongoose.model<IUserDocument, ISoftDeleteUserModel>('Users', UserSchema);

export default UserModel;
