import mongoose, { ObjectId } from 'mongoose';
import bcrypt from 'bcrypt';

export interface User extends Document {
	_id: string;
	email: string;
	username: string;
	password: string;
	photoUrl: string;
	dateOfBirth: Date;
	gender: string;
	phone: string;
	role: string;
	eduBackground?: string;
	employmentStatus?: boolean;
	authenticate: (password: string) => boolean;
	encryptPassword: (password: string) => string;
}

const UserSchema = new mongoose.Schema<User>({
	email: {
		type: String,
		trim: true,
		unique: true,
		validate: {
			validator: function (value: string) {
				return /^[a-z0-9](\.?[a-z0-9]){5,}@g(oogle)?mail\.com$/g.test(value);
			},
			message: (props: any) => `${props.value} is not a valid email address!`,
		},
	},
	password: {
		type: String,
		trim: true,
		minlength: 6,
		maxLength: 16,
	},
	phone: {
		type: String,
		require: true,
		unique: true,
	},
	username: {
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
		default: 'female',
		enum: ['male', 'female'],
	},
	photoUrl: {
		type: String,
		trim: true,
		require: true,
	},

	eduBackground: {
		type: String,
		uppercase: true,
		enum: ['TRUNG CẤP', 'CAO ĐẲNG', 'ĐẠI HỌC', 'CAO HỌC'],
	},
	employmentStatus: {
		type: Boolean,
		default: true,
	},
	role: {
		type: String,
		uppercase: true,
		enum: ['HEADMASTER', 'TEACHER', 'PARENTS'],
	},
});

UserSchema.methods = {
	authenticate(password: string) {
		return bcrypt.compareSync(password, this.password);
	},
	encryptPassword(password: string) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
	},
};

UserSchema.pre('save', function (next) {
	this.password = this.encryptPassword(this.password!);
	this.photoUrl = 'https://ui-avatars.com/api/?name=' + this.username.at(0);
	next();
});

UserSchema.virtual('teacher', {
	localField: '_id',
	foreignField: 'userId',
	ref: 'teachers',
});

UserSchema.virtual('children', {
	localField: '_id',
	foreignField: 'userId',
	ref: 'parents',
});

const UserModel = mongoose.model('Users', UserSchema);

export default UserModel;
