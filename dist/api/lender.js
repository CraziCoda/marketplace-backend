"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
const router = (0, express_1.Router)();
router.get("/view-borrowers", checkAuthenticated, (req, res) => { });
exports.default = router;
