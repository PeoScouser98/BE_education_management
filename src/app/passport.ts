import 'dotenv/config';
import passport from 'passport';
import {
	Strategy as GoogleStrategy,
	VerifyFunctionWithRequest,
	StrategyOptionsWithRequest,
	VerifyCallback,
} from 'passport-google-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../api/models/user.model';
import { authenticateParents } from '../api/services/auth.service';
/**
 * @param options @interface StrategyOptionsWithRequest
 * @param done @type {trategyOptionsWithRequest}
 */
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callbackURL: '/api/auth/google/callback',
			passReqToCallback: true,
		},
		function (req, accessToken, refreshToken, profile, done) {
			try {
				console.log(profile);
				UserModel.findOne({ email: profile.email })
					.select('-password')
					.exec((err, user) => {
						return err ? done(null, false) : done(null, user);
					});
			} catch (error) {
				console.log((error as Error).message);
			}
		} as VerifyFunctionWithRequest
	)
);

/**
 * @param options @interface IStrategyOptionsWithRequest
 * @param done @interface VerifyFunctionWithRequest
 */
// passport.use(
// 	new LocalStrategy(
// 		{
// 			usernameField: 'phone',
// 			passwordField: 'password',
// 			passReqToCallback: true,
// 		},
// 		async (req, phone, password, done) => {
// 			console.log(phone);
// 			const user = await authenticateParents(phone);
// 			return user ? done(null, user) : done(null, false);
// 		}
// 	)
// );

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user!));

export default passport;
