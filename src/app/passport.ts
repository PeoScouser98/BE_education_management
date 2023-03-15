import 'dotenv/config';
import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyFunctionWithRequest } from 'passport-google-oauth2';
import UserModel, { User } from '../api/models/user.model';
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
				UserModel.findOne({ email: profile.email }).exec((err, user) => {
					if (err) {
						return done(null, false);
					} else {
						const displayPicture = user?.picture || profile.picture;
						return done(null, { ...user?.toObject(), picture: displayPicture });
					}
				});
			} catch (error) {
				console.log((error as Error).message);
			}
		} as VerifyFunctionWithRequest
	)
);

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
