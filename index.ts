import express, { Express, Request, Response } from "express";
import passport from "passport";
import session from "express-session";
import auth from "./api/auth/sign";
import lender from "./api/lender";
import cors from "cors";
require("./database/index");

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(
	session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/public", express.static("public"));

app.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

app.get("/login", (req: Request, res: Response) => {
	res.send("Login");
});

app.use("/auth", auth);
app.use("/", lender);

app.listen(port, () => {
	console.log(`[Server]: Server is running at http://localhost:${port}`);
});
