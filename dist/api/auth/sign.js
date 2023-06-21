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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminLoggedin = exports.isLoggedIn = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("./passport"));
const model_1 = __importStar(require("../../database/model"));
const storage_1 = __importDefault(require("../../storage"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isLoggedIn = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, "top-secret", (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};
exports.isLoggedIn = isLoggedIn;
const isAdminLoggedin = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, "top-secret", async (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        const result = await model_1.Admin.findById(user.sub).exec();
        if (result == null)
            return res.sendStatus(401);
        next();
    });
};
exports.isAdminLoggedin = isAdminLoggedin;
const router = express_1.default.Router();
router.post("/admin", (req, res, next) => {
    return passport_1.default.authenticate("admin", { session: false }, (err, token, data) => {
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
    })(req, res, next);
});
router.post("/login", (req, res, next) => {
    //res.json({ status: 200, message: "Login Successful" });
    return passport_1.default.authenticate("local", { session: false }, (err, token, data) => {
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
    })(req, res, next);
});
const registerFields = storage_1.default.fields([
    { name: "image", maxCount: 1 },
    { name: "ghana_card", maxCount: 1 },
    { name: "kin_ghana_card", maxCount: 1 },
    { name: "kin_image", maxCount: 1 },
]);
router.post("/register", registerFields, async (req, res) => {
    const { fname, lname, email, password, occupation, company, tax_number, account_type, contact, kin, kin_contact, address, } = req.body;
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
        images[file] = data === null || data === void 0 ? void 0 : data.path;
    }
    //console.log(account_type);
    if (!(account_type == "borrower" || account_type == "lender")) {
        return res.json({ status: 400, message: "Invalid Inputs" });
    }
    const user = new model_1.default(Object.assign({ fname,
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
        address }, images));
    const result = await user.save();
    res.json({ status: 200, message: "success" });
});
exports.default = router;
