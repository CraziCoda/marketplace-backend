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
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const model_1 = require("./database/model");
let fs = require("fs");
let dir = "./public/uploads";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
require("./database/index");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
app.use((0, express_session_1.default)({ secret: "top-secret", resave: true, saveUninitialized: true }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use("/public", express_1.default.static("public"));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.get("/login", (req, res) => {
    res.send("Login");
});
const online = [];
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
        let msg = new model_1.Message({
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
        const messages = await model_1.Message.find({
            from: { $in: [data.to, data.from] },
            to: { $in: [data.to, data.from] },
        }).exec();
        if (sock != "")
            io.to(sock).emit("messages", messages);
    });
    socket.on("addUser", (data) => {
        for (let i = 0; i < online.length; i++) {
            if (data.user === online[i].user) {
                return;
            }
        }
        online.push(Object.assign({}, data));
    });
    socket.on("fetchMessages", async (data) => {
        let sock = "";
        for (let i = 0; i < online.length; i++) {
            if (online[i].user === data.user1) {
                sock = online[i].sockID;
            }
        }
        const messages = await model_1.Message.find({
            from: { $in: [data.user1, data.user2] },
            to: { $in: [data.user1, data.user2] },
        }).exec();
        if (sock != "")
            io.to(sock).emit("messages", messages);
    });
});
app.use("/auth", sign_1.default);
app.use("/", lender_1.default);
server.listen(port, () => {
    console.log(`[Server]: Server is running at http://localhost:${port}`);
});
