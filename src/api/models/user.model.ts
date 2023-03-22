import mongoose, { ObjectId } from 'mongoose';
import bcrypt from 'bcrypt';
import { emailRegex } from '../validations/user.validation';

export interface User extends Document {
	_id: string;
	email: string;
	displayName: string;
	password: string;
	picture: string;
	dateOfBirth: Date;
	gender: string;
	phone: string;
	role: string;
	eduBackground?: {
		universityName: string;
		graduatedAt: Date;
		qualification: string;
	};
	employmentStatus?: boolean;
	isVerified: boolean;
}

const UserSchema = new mongoose.Schema<User>(
	{
		email: {
			type: String,
			trim: true,
			unique: true,
			validate: {
				validator: function (value: string) {
					return emailRegex.test(value);
				},
				message: (props: any) => `${props.value} is not a valid email address!`,
			},
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
			enum: ['nam', 'nữ'],
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
			uppercase: true,
			trim: true,
			enum: ['ADMIN', 'HEADMASTER', 'TEACHER', 'PARENTS'],
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
	}
);

UserSchema.virtual('children', {
	localField: 'phone',
	foreignField: 'parentsPhoneNumber',
	ref: 'users',
});

const UserModel = mongoose.model('Users', UserSchema);

export default UserModel;
