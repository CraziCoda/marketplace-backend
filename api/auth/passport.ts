import passport from "passport";
import { Strategy } from "passport-local";
import User from "../../database/model";
 
passport.use(
	new Strategy(async (username, password, done) => {
		//Login logic
		const result = await User.findOne({ email: username })
			.exec()
			.catch((err) => {
				console.error(err);
			});
		if (result) {
			console.log(result);
			return done(null, result.id);
		}
		done({ message: "Not Found" }, false);
		console.log(username, password);
	})
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((id, done) => {
	//Find user in list
	done(null, false);
});

export default passport;
