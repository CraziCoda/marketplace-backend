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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("./passport"));
const model_1 = __importDefault(require("../../database/model"));
const router = express_1.default.Router();
router.post("/login", passport_1.default.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    res.send("It is done");
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fname, lname, email, password, occupation, company, tax_number, account_type, contact, ghana_card, image, kin, kin_contact, kin_ghana_card, kin_image, } = req.body;
    if (!(account_type == "Borrower" || account_type == "Lender")) {
        return res.json({ message: "Invalid Inputs" });
    }
    const user = new model_1.default({
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
    });
    const result = yield user.save();
    res.json(req.body);
}));
exports.default = router;
