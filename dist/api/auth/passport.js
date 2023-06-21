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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const model_1 = __importStar(require("../../database/model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
passport_1.default.use("local", new passport_local_1.Strategy({ usernameField: "username", passwordField: "password" }, async (username, password, done) => {
    //Login logic
    //console.log(username, password);
    const result = await model_1.default.findOne({ email: username })
        .exec()
        .catch((err) => {
        console.error(err);
    });
    if (result) {
        //console.log(result);
        const payload = {
            sub: result._id,
        };
        const token = jsonwebtoken_1.default.sign(payload, "top-secret");
        const data = {
            email: result.email,
            type: result.account_type,
        };
        //@ts-ignore
        return done(null, token, data);
    }
    done({ name: "IncorrectCredentialsError", message: "Not Found" }, false);
}));
passport_1.default.use("admin", new passport_local_1.Strategy({ usernameField: "username", passwordField: "password" }, async (username, password, done) => {
    const result = await model_1.Admin.findOne({ username: username })
        .exec()
        .catch((err) => {
        console.error(err);
    });
    if ((result === null || result === void 0 ? void 0 : result.password) == password) {
        const payload = {
            sub: result._id,
        };
        const token = jsonwebtoken_1.default.sign(payload, "top-secret");
        const data = {
            admin: result.username,
        };
        //@ts-ignore
        return done(null, token, data);
    }
    done({ name: "IncorrectCredentialsError", message: "Not Found" }, false);
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((id, done) => {
    //Find user in list
    done(null, false);
});
exports.default = passport_1.default;
