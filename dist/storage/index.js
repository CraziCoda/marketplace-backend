"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        const suffix = file.mimetype.split('/');
        cb(null, `${file.fieldname}-${Date.now()}.${suffix[1]}`);
    },
});
const uploads = (0, multer_1.default)({ storage: storage });
exports.default = uploads;
