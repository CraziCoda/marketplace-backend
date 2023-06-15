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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sign_1 = require("./auth/sign");
const model_1 = __importStar(require("../database/model"));
const router = (0, express_1.Router)();
router.get("/view-borrowers", sign_1.isLoggedIn, (req, res) => {
    res.send("Yes he is");
});
router.get("/view-lenders", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("received")
    const result = yield model_1.default.find({ account_type: "lender" })
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(404).json({});
    });
    res.json(result);
}));
router.get("/showcase", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = req.user.sub;
    const r = yield model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const result = yield model_1.default.find({
        account_type: (r === null || r === void 0 ? void 0 : r.account_type) === "lender" ? "borrower" : "lender",
    })
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(404).json({});
    });
    res.json(result);
}));
router.get("/dashboard", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const r = yield model_1.default.findById(user)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    if ((r === null || r === void 0 ? void 0 : r.account_type) == "lender") {
        const transactions = yield model_1.Transactions.find({ lender: r._id });
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
    }
    else if ((r === null || r === void 0 ? void 0 : r.account_type) == "borrower") {
    }
    else {
        //res.status(401).json({message: "Invalid request"})
    }
}));
router.get("/view", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.query.id;
    const result = yield model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    res.json(result);
}));
router.get("/me", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = req === null || req === void 0 ? void 0 : req.user.sub;
    const result = yield model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    res.json(result);
}));
router.get("/transactions", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = req.user.sub;
    const r = yield model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    let result;
    if ((r === null || r === void 0 ? void 0 : r.account_type) == "lender") {
        result = yield model_1.Transactions.find({ lender: user })
            .where("active")
            .equals(true)
            .exec()
            .catch((err) => {
            console.error(err);
            res.status(404).json({});
        });
    }
    else {
        result = yield model_1.Transactions.find({ borrower: user })
            .where("active")
            .equals(true)
            .exec()
            .catch((err) => {
            console.error(err);
            res.status(404).json({});
        });
    }
    res.json(result);
}));
router.post("/propose", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, amount, date, interest } = req.body;
    //@ts-ignore
    const from = req.user.sub;
    const result = yield model_1.default.findById(from)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const result2 = yield model_1.default.findById(to)
        .exec()
        .catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    if ((result === null || result === void 0 ? void 0 : result.account_type) == (result2 === null || result2 === void 0 ? void 0 : result2.account_type)) {
        return res.status(400).json({ message: "Matching Account types" });
    }
    let lender;
    let borrower;
    if ((result === null || result === void 0 ? void 0 : result.account_type) === "lender") {
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
}));
router.post("/cancel", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction_id = req.body.id;
    model_1.Transactions.findByIdAndUpdate(transaction_id, { active: false }).exec();
    res.json({ message: "Successful" });
}));
router.post("/accept", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = req.user.sub;
    const transaction_id = req.body.id;
    let r = yield model_1.default.findById(user).catch((err) => {
        console.error(err);
        res.status(500).json({});
    });
    const t = yield model_1.Transactions.findById(transaction_id)
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
                $inc: { balance: -(t === null || t === void 0 ? void 0 : t.amount) },
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
        r = yield model_1.default.findById(t === null || t === void 0 ? void 0 : t.lender).exec();
        //@ts-ignore
        if (r.balance < (t === null || t === void 0 ? void 0 : t.amount)) {
            return res
                .status(401)
                .json({ message: "Client does not have enough Funds" });
        }
        else {
            model_1.default.findByIdAndUpdate(t === null || t === void 0 ? void 0 : t.lender, {
                //@ts-ignore
                $inc: { balance: -(t === null || t === void 0 ? void 0 : t.amount) },
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
}));
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
router.post("/withdraw", sign_1.isLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = req.user.sub;
    const amount = req.body.amount;
    let r = yield model_1.default.findById(user).catch((err) => {
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
}));
router.post("/payback", sign_1.isLoggedIn, (req, res) => { });
exports.default = router;
