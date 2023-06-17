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
io.on("connection", (socket) => {
    //console.log("a new user connection");
    socket.on('disconnect', (msg) => {
    });
});
app.use("/auth", sign_1.default);
app.use("/", lender_1.default);
server.listen(port, () => {
    console.log(`[Server]: Server is running at http://localhost:${port}`);
});
