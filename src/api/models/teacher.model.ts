import mongooseAutoPopulate from 'mongoose-autopopulate';
import mongoose, { ObjectId } from 'mongoose';
import bcrypt, { genSaltSync } from 'bcrypt';
import { User } from '../../interfaces/schema.interface';

export interface Teacher extends Document, User {
	_id: ObjectId;
	fullName: string;
	dateOfBirth: Date;
	gender: string;
	eduBackground: ObjectId;
	employmentStatus: string;
}

const TeacherSchema = new mongoose.Schema<Teacher>(
	{
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
			type: String,
			require: true,
			default: 'NỮ',
			enum: ['NAM', 'NỮ'],
		},
		eduBackground: {
			type: String,
			uppercase: true,
			enum: ['TRUNG CẤP', 'CAO ĐẲNG', 'ĐẠI HỌC', 'CAO HỌC'],
		},
		employmentStatus: {
			type: String,
			uppercase: true,
			enum: ['ĐANG CÔNG TÁC', 'ĐÃ NGHỈ VIỆC', 'CHUYỂN CÔNG TÁC'],
		},
	},
	{
		timestamps: true,
	}
);

TeacherSchema.plugin(mongooseAutoPopulate);

TeacherSchema.methods = {
	authenticate(password: string) {
		return bcrypt.compareSync(password, this.password);
	},
	encryptPassword(password: string) {
		return bcrypt.hashSync(password, genSaltSync(10));
	},
};

TeacherSchema.pre('save', function (next) {
	this.password = this.encryptPassword(this.password);
	this.photoUrl = 'https://ui-avatars.com/api/?name=' + this.fullName.at(0);
	next();
});

const TeacherModel = mongoose.model<Teacher>('Teachers', TeacherSchema);

export default TeacherModel;
