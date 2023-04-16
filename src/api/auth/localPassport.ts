import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import UserModel from '../models/user.model';
import { IUser } from '../../types/user.type';
import { MongooseError } from 'mongoose';

passport.use(
	new LocalStrategy(function (phone, password, done) {
		UserModel.findOne({ phone: phone }, function (err: MongooseError, user: IUser) {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false);
			}
			if (!user.verifyPassword(password)) {
				return done(null, false);
			}
			return done(null, user);
		});
	})
);

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user!));
