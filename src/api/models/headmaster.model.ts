import mongoose from 'mongoose';
import { User } from '../../interfaces/schema.interface';
import bcrypt from 'bcrypt';

export interface Headmaster extends Document, User {}

const HeadmasterSchema = new mongoose.Schema<Headmaster>({
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
		default: 'Adminstrator',
	},
	photoUrl: {
		type: String,
		trim: true,
		require: true,
	},
});

HeadmasterSchema.methods = {
	authenticate(password: string) {
		return bcrypt.compareSync(password, this.password);
	},
	encryptPassword(password: string) {
		return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
	},
};

HeadmasterSchema.pre('save', function (next) {
	this.password = this.encryptPassword(this.password);
	this.photoUrl = 'https://ui-avatars.com/api/?name=' + this.fullName.at(0);
	next();
});

const HeadmasterModel = mongoose.model('Headmasters', HeadmasterSchema);

export default HeadmasterModel;
