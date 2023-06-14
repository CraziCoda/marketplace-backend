"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const sign_1 = __importDefault(require("./api/auth/sign"));
const lender_1 = __importDefault(require("./api/lender"));
require("./database/index");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, express_session_1.default)({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.get("/login", (req, res) => {
    res.send("Login");
});
app.use("/auth", sign_1.default);
app.use("/lender", lender_1.default);
app.listen(port, () => {
    console.log(`[Server]: Server is running at http://localhost:${port}`);
});
