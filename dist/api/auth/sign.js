"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLoggedIn = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("./passport"));
const model_1 = __importDefault(require("../../database/model"));
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
const router = express_1.default.Router();
router.post("/login", (req, res, next) => {
    //res.json({ status: 200, message: "Login Successful" });
    return passport_1.default.authenticate("local", { session: false }, (err, token, data) => {
        if (err) {
            if (err.name === "IncorrectCredentialsError") {
                return res.status(400).json({
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
router.post("/register", registerFields, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield user.save();
    res.json({ status: 200, message: "success" });
}));
exports.default = router;
