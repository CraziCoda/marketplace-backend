import { NextFunction, Router, Request, Response } from "express";
import { isAdminLoggedin, isLoggedIn } from "./auth/sign";
import User, { Commission, Transactions } from "../database/model";

const router = Router();

router.get("/view-borrowers", isLoggedIn, (req, res) => {
	res.send("Yes he is");
});

router.get("/view-lenders", isLoggedIn, async (req, res) => {
	// console.log("received")

	const result = await User.find({ account_type: "lender" })
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(404).json({});
		});
	res.json(result);
});

router.get("/showcase", isLoggedIn, async (req, res) => {
	//@ts-ignore
	const user = req.user.sub;

	const r = await User.findById(user).catch((err) => {
		console.error(err);
		res.status(500).json({});
	});

	const result = await User.find({
		account_type: r?.account_type === "lender" ? "borrower" : "lender",
	})
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(404).json({});
		});
	res.json(result);
});

router.get("/dashboard", isLoggedIn, async (req, res) => {
	// console.log("received")
	// const result = await User.findById(req.user.sub)
	// 	.exec()
	// 	.catch((err) => {
	// 		console.error(err);
	// 		res.status(404).json({});
	// 	});
	// res.json(result);

	//@ts-ignore
	const user = req.user.sub;

	const r = await User.findById(user)
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(500).json({});
		});

	const users = await User.find().exec();
	const names = [];
	const ids = [];
	for (let i = 0; i < users.length; i++) {
		names.push(users[i].fname + " " + users[i].lname);
		ids.push(users[i].id);
	}

	if (r?.account_type == "lender") {
		const transactions = await Transactions.find({ lender: r._id });
		let revenue = 0;
		for (let i = 0; i < transactions.length; i++) {
			const transaction = transactions[i];
			if (transaction.accepted == true && transaction.active == false) {
				revenue += transaction.amount * (transaction.interest / 100);
			}
		}

		const data = {
			balance: r.balance,
			transactions: transactions,
			revenue: revenue,
			points: r.points,
			names,
			ids,
		};

		res.json(data);
	} else if (r?.account_type == "borrower") {
		const transactions = await Transactions.find({ borrower: r._id });
		let debt = 0;
		for (let i = 0; i < transactions.length; i++) {
			const transaction = transactions[i];
			if (transaction.accepted == true && transaction.active == true) {
				// debt -= transaction.amount * (transaction.interest / 100);
				debt += transaction.debt;
			}
		}
		const data = {
			points: r.points,
			debt: debt,
			balance: r.balance,
			transactions: transactions,
			names,
			ids,
		};
		res.json(data);
	} else {
		res.status(401).json({ message: "Invalid request" });
	}
});
router.get("/view", async (req, res) => {
	const user = req.query.id;

	const result = await User.findById(user).catch((err) => {
		console.error(err);
		res.status(500).json({});
	});

	res.json(result);
});

router.get("/me", isLoggedIn, async (req, res) => {
	//@ts-ignore
	const user = req?.user.sub;

	const result = await User.findById(user).catch((err) => {
		console.error(err);
		res.status(500).json({});
	});

	res.json(result);
});

router.get("/transactions", isLoggedIn, async (req, res) => {
	//@ts-ignore
	const user = req.user.sub;

	const r = await User.findById(user).catch((err) => {
		console.error(err);
		res.status(500).json({});
	});

	let result;

	if (r?.account_type == "lender") {
		result = await Transactions.find({ lender: user })
			.where("active")
			.equals(true)
			.exec()
			.catch((err) => {
				console.error(err);
				res.status(404).json({});
			});
	} else {
		result = await Transactions.find({ borrower: user })
			.where("active")
			.equals(true)
			.exec()
			.catch((err) => {
				console.error(err);
				res.status(404).json({});
			});
	}
	res.json(result);
});

router.post("/propose", isLoggedIn, async (req, res) => {
	const { to, amount, date, interest } = req.body;

	//@ts-ignore
	const from = req.user.sub;
	const result = await User.findById(from)
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(500).json({});
		});

	const result2 = await User.findById(to)
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(500).json({});
		});

	if (result?.account_type == result2?.account_type) {
		return res.status(400).json({ message: "Matching Account types" });
	}

	let lender;
	let borrower;
	if (result?.account_type === "lender") {
		lender = result._id;
		borrower = to;
	} else {
		lender = to;
		borrower = result?._id;
	}
	const due_date = new Date(date);
	const proposer = result?._id;

	console.log();
	const transaction = new Transactions({
		borrower,
		lender,
		amount,
		due_date,
		proposer,
		interest,
	});

	transaction.save();

	res.status(200).json(transaction);
});

router.post("/cancel", isLoggedIn, async (req, res) => {
	const transaction_id = req.body.id;
	Transactions.findByIdAndUpdate(transaction_id, { active: false }).exec();

	res.json({ message: "Successful" });
});

router.post("/accept", isLoggedIn, async (req, res) => {
	//@ts-ignore
	const user = req.user.sub;
	const transaction_id = req.body.id;

	let r = await User.findById(user).catch((err) => {
		console.error(err);
		res.status(500).json({});
	});

	const t = await Transactions.findById(transaction_id)
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(500).json({});
		});

	if (r?.account_type === "lender") {
		//@ts-ignore
		if (r.balance < t?.amount) {
			return res.status(401).json({ message: "Not enough Funds" });
		} else {
			User.findByIdAndUpdate(t?.lender, {
				//@ts-ignore
				$inc: { balance: -t?.amount, points: 10 },
			}).exec();
			User.findByIdAndUpdate(t?.borrower, {
				$inc: { balance: t?.amount },
			}).exec();

			Transactions.findByIdAndUpdate(transaction_id, {
				accepted: true,
				//@ts-ignore
				debt: -(t?.amount + (t?.interest / 100) * t?.amount),
			}).exec();
		}
	} else {
		r = await User.findById(t?.lender).exec();
		//@ts-ignore
		if (r.balance < t?.amount) {
			return res
				.status(401)
				.json({ message: "Client does not have enough Funds" });
		} else {
			User.findByIdAndUpdate(t?.lender, {
				//@ts-ignore
				$inc: { balance: -t?.amount, points: 10 },
			}).exec();

			User.findByIdAndUpdate(t?.borrower, {
				$inc: { balance: t?.amount },
			}).exec();

			Transactions.findByIdAndUpdate(transaction_id, {
				accepted: true,
				//@ts-ignore
				debt: -(t?.amount + (t?.interest / 100) * t?.amount),
			}).exec();
		}
	}

	res.json({ message: "Successfull" });
});
router.post("/deposit", isLoggedIn, (req, res) => {
	//@ts-ignore
	const user = req.user.sub;
	const amount = req.body.amount;

	User.findByIdAndUpdate(user, {
		//@ts-ignore
		$inc: { balance: amount },
	}).exec();

	res.json({ message: `Deposit Successfull` });
});
router.post("/withdraw", isLoggedIn, async (req, res) => {
	//@ts-ignore
	const user = req.user.sub;
	const amount = req.body.amount;

	let r = await User.findById(user).catch((err) => {
		console.error(err);
		res.status(500).json({});
	});

	//@ts-ignore
	if (r?.balance >= amount) {
		User.findByIdAndUpdate(user, {
			//@ts-ignore
			$inc: { balance: -amount },
		}).exec();

		return res.json({ message: `Withdrawal Successfull` });
	}
	res.json({ message: `Insufficient funds` });
});

router.post("/payback", isLoggedIn, async (req, res) => {
	//@ts-ignore
	const user = req.user?.sub;
	const transaction_id = req.query.id;
	const r = await User.findById(user).exec();
	const t = await Transactions.findById(transaction_id).exec();
	const c = (await Commission.find().exec())[0];

	//@ts-ignore
	if (r?.balance < Math.abs(t?.debt)) {
		return res.json({
			message: "Insufficient funds",
			status: 401,
		});
	}

	//@ts-ignore
	const profit = t?.amount * (t?.interest / 100);

	const rate = profit * (c.lender / 100);
	//@ts-ignore
	const b_pay = t?.debt;

	User.findByIdAndUpdate(t?.borrower, {
		$inc: { balance: b_pay, points: 10 },
	}).exec();
	User.findByIdAndUpdate(t?.lender, {
		//@ts-ignore
		$inc: { balance: -b_pay - rate },
	}).exec();

	Transactions.findByIdAndUpdate(t?._id, {
		//@ts-ignore
		$set: { active: false, amount_settled: -b_pay },
	}).exec();

	const result = await Transactions.find({ borrower: user })
		.where("active")
		.equals(true)
		.exec()
		.catch((err) => {
			console.error(err);
			res.status(404).json({});
		});

	res.json({ result: result, status: 200 });

	//Transactions.findByIdAndUpdate(transaction_id, {});
});

router.post("/changeRates", isAdminLoggedin, async (req, res) => {
	const c = await Commission.find().exec();

	const r = await Commission.findByIdAndUpdate(c[0].id, {
		$set: { lender: req.body.lender, borrower: req.body.borrower },
	});

	const a = await Commission.find().exec();
	res.json(a[0]);
});

router.get("/commission", async (req, res) => {
	const c = await Commission.find().exec();
	res.json(c[0]);
});

router.get("/allusers", isAdminLoggedin, async (req, res) => {
	const r = await User.find();
	res.json(r);
});

router.get("/verify", isAdminLoggedin, async (req, res) => {
	const id = req.query.id;

	User.findByIdAndUpdate(id, { $set: { verified: true } }).exec();

	const result = await User.findById(id).exec();
	res.json(result);
});

router.get("/suspend", isAdminLoggedin, async (req, res) => {
	const id = req.query.id;

	User.findByIdAndUpdate(id, { $set: { suspended: true } }).exec();

	const result = await User.findById(id).exec();
	res.json(result);
});

router.get("/unsuspend", isAdminLoggedin, async (req, res) => {
	const id = req.query.id;

	User.findByIdAndUpdate(id, { $set: { suspended: false } }).exec();

	const result = await User.findById(id).exec();
	res.json(result);
});

router.get("/promote", isAdminLoggedin, async (req, res) => {
	const id = req.query.id;

	User.findByIdAndUpdate(id, { $set: { promoted: true } }).exec();

	const result = await User.findById(id).exec();
	res.json(result);
});

router.get("/unpromote", isAdminLoggedin, async (req, res) => {
	const id = req.query.id;

	User.findByIdAndUpdate(id, { $set: { promoted: false } }).exec();

	const result = await User.findById(id).exec();
	res.json(result);
});

export default router;
