import express from "express";
import passport from "./passport";
import User from "../../database/model";

const router = express.Router();

router.post(
	"/login",
	passport.authenticate("local", { failureRedirect: "/login" }),
	(req, res) => {
		res.send("It is done");
	}
);

router.post("/register", async (req, res) => {
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
		ghana_card,
		image,
		kin,
		kin_contact,
		kin_ghana_card,
		kin_image,
		address
	} = req.body;


	if (!(account_type == "Borrower" || account_type == "Lender")) {
		return res.json({ message: "Invalid Inputs" });
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
		ghana_card,
		image,
		kin,
		kin_contact,
		kin_ghana_card,
		kin_image,
		address
	});

	const result = await user.save();


	res.json(req.body);
});

export default router;
