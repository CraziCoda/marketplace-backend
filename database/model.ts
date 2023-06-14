import mongoose, { Schema } from "mongoose";

interface BorrowerI {
	id: string;
	amount: number;
	due_date: Date;
}

interface UserI {
	fname: string;
	lname: string;
	email: string;
	password: string;
	occupation: string;
	company: string;
	tax_number: string;
	verified: boolean;
	account_type: "Borrower" | "Lender";
	points: number;
	contact: string;
	ghana_card: string;
	image: string;
	kin: string;
	kin_contact: string;
	kin_ghana_card: string;
	kin_image: string;
	address: string;
	balance: number;
}

const UserSchema = new Schema<UserI>({
	fname: { type: String, required: true },
	lname: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	occupation: { type: String, required: true },
	company: { type: String, required: false },
	tax_number: { type: String, required: false },
	verified: { type: Boolean, required: true, default: false },
	account_type: { type: String, required: true, default: "Borrower" },
	points: { type: Number, required: true, default: 0 },
	contact: { type: String, required: true },
	ghana_card: { type: String, required: true },
	image: { type: String, required: true },
	kin: { type: String, required: true },
	kin_contact: { type: String, required: true },
	kin_ghana_card: { type: String, required: true },
	kin_image: { type: String, required: true },
	balance: { type: Number, required: true, default: 0 },
	address: { type: String, required: true },
});

const User = mongoose.model<UserI>("User", UserSchema);

export default User;
