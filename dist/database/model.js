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
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
});
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;