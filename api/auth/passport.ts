import passport from "passport";
import { IVerifyOptions, Strategy } from "passport-local";
import User from "../../database/model";
import jwt from "jsonwebtoken";

passport.use(
	"local",
	new Strategy(
		{ usernameField: "username", passwordField: "password" },
		async (username, password, done) => {
			//Login logic
			console.log(username, password);
			const result = await User.findOne({ email: username })
				.exec()
				.catch((err) => {
					console.error(err);
				});
			if (result) {
				//console.log(result);
				const payload = {
					sub: result._id,
				};
				const token = jwt.sign(payload, "top-secret");

				const data = {
					email: result.email,
					type: result.account_type
				};

				//@ts-ignore
				return done(null, token, data);
			}
			console.log("It started");

			done({ name: "IncorrectCredentialsError", message: "Not Found" }, true);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((id, done) => {
	//Find user in list
	done(null, false);
});

export default passport;
