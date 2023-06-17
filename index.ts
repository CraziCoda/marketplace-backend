import express, { Express, Request, Response } from "express";
import passport from "passport";
import session from "express-session";
import auth from "./api/auth/sign";
import lender from "./api/lender";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

require("./database/index");

const app: Express = express();
const port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

app.use(
	session({ secret: "top-secret", resave: true, saveUninitialized: true })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
	cors({
		origin: "*",
	})
);
app.use("/public", express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req: Request, res: Response) => {
	res.send("Express + TypeScript Server");
});

app.get("/login", (req: Request, res: Response) => {
	res.send("Login");
});

io.on("connection", (socket) => {
	//console.log("a new user connection");
	socket.on('disconnect', (msg)=>{

	})
});

app.use("/auth", auth);
app.use("/", lender);

server.listen(port, () => {
	console.log(`[Server]: Server is running at http://localhost:${port}`);
});
