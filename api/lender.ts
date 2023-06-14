import { NextFunction, Router, Request, Response } from "express";

const checkAuthenticated = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
};

const router = Router();

router.get("/view-borrowers", checkAuthenticated, (req, res) => {});

export default router;
