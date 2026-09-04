import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
	const authorization = req.headers.authorization;
	const token = authorization?.startsWith("Bearer ")
		? authorization.slice(7)
		: null;

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Authentication required",
		});
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = { id: payload.userId };
		next();
	} catch {
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}
}
