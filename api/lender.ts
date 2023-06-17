import { NextFunction, Router, Request, Response } from "express";
import { isLoggedIn } from "./auth/sign";
import User, { Transactions } from "../database/model";

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
		};

		res.json(data);
	} else if (r?.account_type == "borrower") {
	} else {
		//res.status(401).json({message: "Invalid request"})
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
				$inc: { balance: -t?.amount },
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
				$inc: { balance: -t?.amount },
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
router.post("/payback", isLoggedIn, (req, res) => {});

export default router;
