import express, { Express, Request, Response } from "express";
import passport from "passport";
import session from "express-session";
import auth from "./api/auth/sign";
import lender from "./api/lender";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { Message } from "./database/model";

let fs = require("fs");
let dir = "./public/uploads";

if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir, { recursive: true });
}

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

interface OnlineI {
	user: string;
	sockID: string;
}

const online: OnlineI[] = [];

io.on("connection", (socket) => {
	//console.log("a new user connection");
	socket.on("disconnect", (msg) => {
		for (let i = 0; i < online.length; i++) {
			if (socket.id === online[i].sockID) {
				online.splice(i, 1);
			}
		}
	});

	socket.on("newMessage", async (data) => {
		let msg = new Message({
			to: data.to,
			from: data.from,
			time: data.date,
			message: data.msg,
		});
		msg.save();

		let sock = "";

		for (let i = 0; i < online.length; i++) {
			if (online[i].user === data.to) {
				sock = online[i].sockID;
			}
		}

		const messages = await Message.find({
			from: { $in: [data.to, data.from] },
			to: { $in: [data.to, data.from] },
		}).exec();

		if (sock != "") io.to(sock).emit("messages", messages);
	});

	socket.on("addUser", (data) => {
		for (let i = 0; i < online.length; i++) {
			if (data.user === online[i].user) {
				return;
			}
		}
		online.push({ ...data });
	});

	socket.on("fetchMessages", async (data) => {
		let sock = "";

		for (let i = 0; i < online.length; i++) {
			if (online[i].user === data.user1) {
				sock = online[i].sockID;
			}
		}

		const messages = await Message.find({
			from: { $in: [data.user1, data.user2] },
			to: { $in: [data.user1, data.user2] },
		}).exec();

		if (sock != "") io.to(sock).emit("messages", messages);
	});
});

app.use("/auth", auth);
app.use("/", lender);

server.listen(port, () => {
	console.log(`[Server]: Server is running at http://localhost:${port}`);
});
