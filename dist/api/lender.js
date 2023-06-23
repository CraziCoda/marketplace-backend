"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sign_1 = require("./auth/sign");
const model_1 = __importStar(require("../database/model"));
const router = (0, express_1.Router)();
router.get("/view-borrowers", sign_1.isLoggedIn, (req, res) => {
    res.send("Yes he is");
});
router.get("/view-lenders", sign_1.isLoggedIn, async (req, res) => {
    // console.log("received")
    const result = await model_1.default.find({ account_type: "lender" })
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(404).json({});
    });
    res.json(result);
});
router.get("/showcase", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const r = await model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const result = await model_1.default.find({
        account_type: (r === null || r === void 0 ? void 0 : r.account_type) === "lender" ? "borrower" : "lender",
    })
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(404).json({});
    });
    res.json(result);
});
router.get("/dashboard", sign_1.isLoggedIn, async (req, res) => {
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
    const r = await model_1.default.findById(user)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const users = await model_1.default.find().exec();
    const names = [];
    const ids = [];
    for (let i = 0; i < users.length; i++) {
        names.push(users[i].fname + " " + users[i].lname);
        ids.push(users[i].id);
    }
    if ((r === null || r === void 0 ? void 0 : r.account_type) == "lender") {
        const transactions = await model_1.Transactions.find({ lender: r._id });
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
            id: r._id,
        };
        res.json(data);
    }
    else if ((r === null || r === void 0 ? void 0 : r.account_type) == "borrower") {
        const transactions = await model_1.Transactions.find({ borrower: r._id });
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
            id: r._id,
        };
        res.json(data);
    }
    else {
        res.status(401).json({ message: "Invalid request" });
    }
});
router.get("/view", async (req, res) => {
    const user = req.query.id;
    const result = await model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    res.json(result);
});
router.get("/me", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req === null || req === void 0 ? void 0 : req.user.sub;
    const result = await model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    res.json(result);
});
router.get("/transactions", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const r = await model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    let result;
    if ((r === null || r === void 0 ? void 0 : r.account_type) == "lender") {
        result = await model_1.Transactions.find({ lender: user })
            .where("active")
            .equals(true)
            .exec()
            .catch((err) => {
            console.error(err);
            res.status(404).json({});
        });
    }
    else {
        result = await model_1.Transactions.find({ borrower: user })
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
router.post("/propose", sign_1.isLoggedIn, async (req, res) => {
    const { to, amount, date, interest } = req.body;
    //@ts-ignore
    const from = req.user.sub;
    const result = await model_1.default.findById(from)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const result2 = await model_1.default.findById(to)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    if (!(result === null || result === void 0 ? void 0 : result.verified) || !(result2 === null || result2 === void 0 ? void 0 : result2.verified)) {
        res.status(401).json({
            message: "Can't make a request to or from a non verified account",
        });
        return;
    }
    if ((result === null || result === void 0 ? void 0 : result.suspended) || (result2 === null || result2 === void 0 ? void 0 : result2.suspended)) {
        res.status(401).json({
            message: "Can't make a request to or from a suspended account",
        });
        return;
    }
    if ((result === null || result === void 0 ? void 0 : result.account_type) == (result2 === null || result2 === void 0 ? void 0 : result2.account_type)) {
        return res.status(400).json({ message: "Matching Account types" });
    }
    let lender;
    let borrower;
    if ((result === null || result === void 0 ? void 0 : result.account_type) === "lender") {
        if (result.balance < amount) {
            return res.status(401).json({ message: "Not Enough funds" });
        }
        lender = result._id;
        borrower = to;
    }
    else {
        lender = to;
        borrower = result === null || result === void 0 ? void 0 : result._id;
    }
    const due_date = new Date(date);
    const proposer = result === null || result === void 0 ? void 0 : result._id;
    console.log();
    const transaction = new model_1.Transactions({
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
router.post("/cancel", sign_1.isLoggedIn, async (req, res) => {
    const transaction_id = req.body.id;
    model_1.Transactions.findByIdAndUpdate(transaction_id, { active: false }).exec();
    res.json({ message: "Successful" });
});
router.post("/accept", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const transaction_id = req.body.id;
    let r = await model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const t = await model_1.Transactions.findById(transaction_id)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    if ((r === null || r === void 0 ? void 0 : r.account_type) === "lender") {
        //@ts-ignore
        if (r.balance < (t === null || t === void 0 ? void 0 : t.amount)) {
            return res.status(401).json({ message: "Not enough Funds" });
        }
        else {
            model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.lender, {
                //@ts-ignore
                $inc: { balance: -(t === null || t === void 0 ? void 0 : t.amount), points: 10 },
            }).exec();
            model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.borrower, {
                $inc: { balance: t === null || t === void 0 ? void 0 : t.amount },
            }).exec();
            model_1.Transactions.findByIdAndUpdate(transaction_id, {
                accepted: true,
                //@ts-ignore
                debt: -((t === null || t === void 0 ? void 0 : t.amount) + ((t === null || t === void 0 ? void 0 : t.interest) / 100) * (t === null || t === void 0 ? void 0 : t.amount)),
            }).exec();
        }
    }
    else {
        r = await model_1.default.findById(t === null || t === void 0 ? void 0 : t.lender).exec();
        //@ts-ignore
        if (r.balance < (t === null || t === void 0 ? void 0 : t.amount)) {
            return res
                .status(401)
                .json({ message: "Client does not have enough Funds" });
        }
        else {
            model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.lender, {
                //@ts-ignore
                $inc: { balance: -(t === null || t === void 0 ? void 0 : t.amount), points: 10 },
            }).exec();
            model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.borrower, {
                $inc: { balance: t === null || t === void 0 ? void 0 : t.amount },
            }).exec();
            model_1.Transactions.findByIdAndUpdate(transaction_id, {
                accepted: true,
                //@ts-ignore
                debt: -((t === null || t === void 0 ? void 0 : t.amount) + ((t === null || t === void 0 ? void 0 : t.interest) / 100) * (t === null || t === void 0 ? void 0 : t.amount)),
            }).exec();
        }
    }
    res.json({ message: "Successfull" });
});
router.post("/deposit", sign_1.isLoggedIn, (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const amount = req.body.amount;
    model_1.default.findByIdAndUpdate(user, {
        //@ts-ignore
        $inc: { balance: amount },
    }).exec();
    res.json({ message: `Deposit Successfull` });
});
router.post("/withdraw", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const amount = req.body.amount;
    let r = await model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    //@ts-ignore
    if ((r === null || r === void 0 ? void 0 : r.balance) >= amount) {
        model_1.default.findByIdAndUpdate(user, {
            //@ts-ignore
            $inc: { balance: -amount },
        }).exec();
        return res.json({ message: `Withdrawal Successfull` });
    }
    res.json({ message: `Insufficient funds` });
});
router.post("/payback", sign_1.isLoggedIn, async (req, res) => {
    var _a;
    //@ts-ignore
    const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub;
    const transaction_id = req.query.id;
    const r = await model_1.default.findById(user).exec();
    const t = await model_1.Transactions.findById(transaction_id).exec();
    const c = (await model_1.Commission.find().exec())[0];
    //@ts-ignore
    if ((r === null || r === void 0 ? void 0 : r.balance) < Math.abs(t === null || t === void 0 ? void 0 : t.debt)) {
        return res.json({
            message: "Insufficient funds",
            status: 401,
        });
    }
    //@ts-ignore
    const profit = (t === null || t === void 0 ? void 0 : t.amount) * ((t === null || t === void 0 ? void 0 : t.interest) / 100);
    const rate = profit * (c.lender / 100);
    //@ts-ignore
    const b_pay = t === null || t === void 0 ? void 0 : t.debt;
    model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.borrower, {
        $inc: { balance: b_pay, points: 10 },
    }).exec();
    model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.lender, {
        //@ts-ignore
        $inc: { balance: -b_pay - rate },
    }).exec();
    model_1.Transactions.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t._id, {
        //@ts-ignore
        $set: { active: false, amount_settled: -b_pay },
    }).exec();
    const result = await model_1.Transactions.find({ borrower: user })
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
router.post("/changeRates", sign_1.isAdminLoggedin, async (req, res) => {
    const c = await model_1.Commission.find().exec();
    const r = await model_1.Commission.findByIdAndUpdate(c[0].id, {
        $set: { lender: req.body.lender, borrower: req.body.borrower },
    });
    const a = await model_1.Commission.find().exec();
    res.json(a[0]);
});
router.get("/verifyToken", sign_1.isAdminLoggedin, (req, res) => {
    res.status(200).json(req.user);
});
router.get("/commission", async (req, res) => {
    const c = await model_1.Commission.find().exec();
    res.json(c[0]);
});
router.get("/allusers", sign_1.isAdminLoggedin, async (req, res) => {
    const r = await model_1.default.find();
    res.json(r);
});
router.get("/verify", sign_1.isAdminLoggedin, async (req, res) => {
    const id = req.query.id;
    model_1.default.findByIdAndUpdate(id, { $set: { verified: true } }).exec();
    const result = await model_1.default.findById(id).exec();
    res.json(result);
});
router.get("/suspend", sign_1.isAdminLoggedin, async (req, res) => {
    const id = req.query.id;
    model_1.default.findByIdAndUpdate(id, { $set: { suspended: true } }).exec();
    const result = await model_1.default.findById(id).exec();
    res.json(result);
});
router.get("/unsuspend", sign_1.isAdminLoggedin, async (req, res) => {
    const id = req.query.id;
    model_1.default.findByIdAndUpdate(id, { $set: { suspended: false } }).exec();
    const result = await model_1.default.findById(id).exec();
    res.json(result);
});
router.get("/promote", sign_1.isAdminLoggedin, async (req, res) => {
    const id = req.query.id;
    model_1.default.findByIdAndUpdate(id, { $set: { promoted: true } }).exec();
    const result = await model_1.default.findById(id).exec();
    res.json(result);
});
router.get("/unpromote", sign_1.isAdminLoggedin, async (req, res) => {
    const id = req.query.id;
    model_1.default.findByIdAndUpdate(id, { $set: { promoted: false } }).exec();
    const result = await model_1.default.findById(id).exec();
    res.json(result);
});
function getNumberOfMonthsFromUnix(unixTimestamp) {
    // Convert Unix timestamp to milliseconds
    const timestampMs = unixTimestamp;
    // Create a new Date object using the timestamp
    const date = new Date(timestampMs);
    // Get the month and year from the Date object
    const month = date.getMonth();
    const year = date.getFullYear();
    // Calculate the number of months
    const numberOfMonths = year * 12 + month;
    return numberOfMonths;
}
router.post("/requestPromotion", sign_1.isLoggedIn, async (req, res) => {
    var _a, _b;
    const { points, due_date } = req.body;
    const date = new Date(due_date).getTime();
    const end_month = getNumberOfMonthsFromUnix(date);
    const now = new Date().getTime();
    const start_month = getNumberOfMonthsFromUnix(now);
    const num_months = end_month - start_month;
    const cost_per_month = 50;
    const cost_per_point = 2;
    const cost = parseInt(points) * cost_per_point +
        (num_months == 0 ? cost_per_month : cost_per_month * num_months);
    const promo = new model_1.Promotion({
        amount: cost,
        points: parseInt(points),
        due_date: new Date(due_date),
        //@ts-ignore
        lender: (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub,
    });
    promo.save();
    const promos = await model_1.Promotion.find({
        //@ts-ignore
        lender: (_b = req.user) === null || _b === void 0 ? void 0 : _b.sub,
    }).exec();
    res.json(promos);
});
router.post("/acceptPromo", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const id = req.query.id;
    const p = await model_1.Promotion.findById(id).exec();
    const amount = p === null || p === void 0 ? void 0 : p.amount;
    const r = await model_1.default.findById(user).exec();
    //@ts-ignore
    if ((r === null || r === void 0 ? void 0 : r.balance) < amount) {
        return res.status(401).json({
            message: "Insufficient",
        });
    }
    model_1.default.findByIdAndUpdate(user, {
        //@ts-ignore
        $inc: { balance: -amount, points: p === null || p === void 0 ? void 0 : p.points },
        $set: { promoted: true },
    }).exec();
    model_1.Promotion.findByIdAndUpdate(id, { $set: { paid: true } }).exec();
    const promos = await model_1.Promotion.find({
        lender: user,
    }).exec();
    res.json(promos);
});
router.post("/cancelPromo", sign_1.isLoggedIn, async (req, res) => {
    //@ts-ignore
    const user = req.user.sub;
    const id = req.query.id;
    model_1.Promotion.findByIdAndDelete(id).exec();
    const promos = await model_1.Promotion.find({
        lender: user,
    }).exec();
    res.json(promos);
});
router.get("/promotions", sign_1.isLoggedIn, async (req, res) => {
    var _a;
    const promos = await model_1.Promotion.find({
        //@ts-ignore
        lender: (_a = req.user) === null || _a === void 0 ? void 0 : _a.sub,
    }).exec();
    res.json(promos);
});
exports.default = router;
