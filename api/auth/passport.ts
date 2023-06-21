import passport from "passport";
import { IVerifyOptions, Strategy } from "passport-local";
import User, { Admin } from "../../database/model";
import jwt from "jsonwebtoken";

passport.use(
	"local",
	new Strategy(
		{ usernameField: "username", passwordField: "password" },
		async (username, password, done) => {
			//Login logic
			//console.log(username, password);
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
					type: result.account_type,
				};

				//@ts-ignore
				return done(null, token, data);
			}
			done({ name: "IncorrectCredentialsError", message: "Not Found" }, false);
		}
	)
);

passport.use(
	"admin",
	new Strategy(
		{ usernameField: "username", passwordField: "password" },
		async (username, password, done) => {
			const result = await Admin.findOne({ username: username })
				.exec()
				.catch((err) => {
					console.error(err);
				});

			if(result?.password == password){
				const payload = {
					sub: result._id,
				};
				const token = jwt.sign(payload, "top-secret");

				const data = {
					admin: result.username,
				};

				//@ts-ignore
				return done(null, token, data);
			}

			done({ name: "IncorrectCredentialsError", message: "Not Found" }, false);


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
