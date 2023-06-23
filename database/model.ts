import mongoose, { Schema } from "mongoose";
import { type } from "os";

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
	account_type: "borrower" | "lender";
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
	promoted: boolean;
	suspended: boolean;

	ratings: RatingI[];
}

interface AdminI {
	username: string;
	password: string;
}

interface CommissionI {
	borrower: number;
	lender: number;
}

interface RatingI {
	from: string;
	rate: number;
}

interface TransactionsI {
	borrower: string;
	lender: string;
	amount: number;
	due_date: Date;
	amount_settled: number;
	active: boolean;
	proposer: "lender" | "borrower";
	accepted: boolean;
	interest: number;
	debt: number;
}

interface MessagesI {
	message: string;
	from: string;
	to: string;
	time: Date;
}

interface PromotionI {
	points: number;
	due_date: Date;
	amount: number;
	resolved: boolean;
}

const RatingSchema = new Schema<RatingI>({
	from: { type: String, required: true },
	rate: { type: Number, min: 0, max: 5 },
});

const CommissionSchema = new Schema<CommissionI>({
	borrower: { type: Number, max: 100, min: 0, required: true, default: 10 },
	lender: { type: Number, max: 100, min: 0, required: true, default: 10 },
});

const TransactionsSchema = new Schema<TransactionsI>({
	borrower: { type: String, required: true },
	lender: { type: String, required: true },
	amount: { type: Number, required: true },
	due_date: { type: Date, required: true },
	amount_settled: { type: Number, default: 0 },
	active: { type: Boolean, default: true },
	accepted: { type: Boolean, default: false },
	proposer: { type: String, required: true },
	interest: { type: Number, required: true },
	debt: { type: Number, default: 0 },
});

const UserSchema = new Schema<UserI>({
	fname: { type: String, required: true },
	lname: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
	occupation: { type: String, required: true },
	company: { type: String, required: false },
	tax_number: { type: String, required: false },
	verified: { type: Boolean, required: true, default: false },
	account_type: { type: String, required: true, default: "borrower" },
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
	promoted: { type: Boolean, default: false },
	suspended: { type: Boolean, default: false },
});

const MessagesSchema = new Schema<MessagesI>({
	message: { type: String, required: true },
	from: { type: String, required: true },
	to: { type: String, required: true },
	time: { type: Date, required: true },
});

const AdminSchema = new Schema<AdminI>({
	username: { type: String, required: true },
	password: { type: String, required: true },
});

const PromotionSchema = new Schema<PromotionI>({
	points: { type: Number, required: true },
	amount: { type: Number, required: true },
	due_date: { type: Date, required: true },
	resolved: { type: Boolean, default: false },
});

export const Promotion = mongoose.model<PromotionI>(
	"Promotion",
	PromotionSchema
);

const User = mongoose.model<UserI>("User", UserSchema);
export const Transactions = mongoose.model<TransactionsI>(
	"Transactions",
	TransactionsSchema
);

export const Commission = mongoose.model<CommissionI>(
	"Commission",
	CommissionSchema
);
async function comSet() {
	const com = await Commission.find().exec();
	if (com.length > 1) return true;
	else {
		const commission = new Commission({});
		commission.save();
	}
}

export const Admin = mongoose.model<AdminI>("Admin", AdminSchema);

async function adSet() {
	const ad = await Admin.find().exec();
	if (ad.length > 1) return true;
	else {
		const admin = new Admin({
			username: "admin69",
			password: "4321",
		});
		admin.save();
	}
}

adSet();
comSet();

export const Message = mongoose.model<MessagesI>("Message", MessagesSchema);

export default User;
