import express, { Request, Response, NextFunction } from "express";
import passport from "./passport";
import User, { Admin } from "../../database/model";
import uploads from "../../storage";
import jwt from "jsonwebtoken";

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.sendStatus(401);
	}
	jwt.verify(token, "top-secret", (err: any, user: any) => {
		if (err) {
			return res.sendStatus(403);
		}
		req.user = user;
		next();
	});
};

export const isAdminLoggedin = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.sendStatus(401);
	}
	jwt.verify(token, "top-secret", async (err: any, user: any) => {
		if (err) {
			return res.sendStatus(403);
		}
		req.user = user;
		const result = await Admin.findById(user.sub).exec();
		if (result == null) return res.sendStatus(401);
		next();
	});
};

const router = express.Router();

router.post("/admin", (req, res, next) => {
	return passport.authenticate(
		"admin",
		{ session: false },
		(err: { name: string; message: any }, token: any, data: any) => {
			if (err) {
				if (err.name === "IncorrectCredentialsError") {
					return res.status(200).json({
						success: false,
						message: err.message,
					});
				}
				return res.status(400).json({
					success: false,
					message: "Login Failed.",
				});
			}
			if (token)
				return res.json({
					success: true,
					message: "You have successfully logged in!",
					token,
					user: data,
				});
			return res.status(200).json({
				success: false,
				message: "Loggin Failed",
			});
		}
	)(req, res, next);
});

router.post("/login", (req, res, next) => {
	//res.json({ status: 200, message: "Login Successful" });
	return passport.authenticate(
		"local",
		{ session: false },
		(err: { name: string; message: any }, token: any, data: any) => {
			if (err) {
				if (err.name === "IncorrectCredentialsError") {
					return res.status(200).json({
						success: false,
						message: err.message,
					});
				}
				return res.status(400).json({
					success: false,
					message: "Could not process the form.",
				});
			}
			return res.json({
				success: true,
				message: "You have successfully logged in!",
				token,
				user: data,
			});
		}
	)(req, res, next);
});

const registerFields = uploads.fields([
	{ name: "image", maxCount: 1 },
	{ name: "ghana_card", maxCount: 1 },
	{ name: "kin_ghana_card", maxCount: 1 },
	{ name: "kin_image", maxCount: 1 },
]);

router.post("/register", registerFields, async (req, res) => {
	const {
		fname,
		lname,
		email,
		password,
		occupation,
		company,
		tax_number,
		account_type,
		contact,
		kin,
		kin_contact,
		address,
	} = req.body;

	//console.log(fname);
	const files = req.files;

	// console.log(files);

	const images = {
		ghana_card: "",
		image: "",
		kin_ghana_card: "",
		kin_image: "",
	};

	for (let file in files) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore comment
		const data = files[file][0];
		//console.log(data);

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore comment
		images[file] = data?.path;
	}

	//console.log(account_type);

	if (!(account_type == "borrower" || account_type == "lender")) {
		return res.json({ status: 400, message: "Invalid Inputs" });
	}

	const user = new User({
		fname,
		lname,
		email,
		password,
		occupation,
		company,
		tax_number,
		account_type,
		contact,
		kin,
		kin_contact,
		address,
		...images,
	});

	const result = await user.save();

	res.json({ status: 200, message: "success" });
});

export default router;
