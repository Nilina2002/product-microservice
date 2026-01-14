import jwt from "jsonwebtoken";
import "dotenv/config";

export function extractUserFromToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token format is invalid" });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = {
      user_id: payload.user_id,
      company_id: payload.company_id,
      role: payload.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

export function validateCompanyOwnership(req, res, next) {
  const userCompanyId = req.user?.company_id;

  if (!userCompanyId) {
    return res.status(401).json({ message: "User company not found in token" });
  }

  const requestCompanyId = req.body.companyId || req.query.companyId;

  if (requestCompanyId && requestCompanyId !== userCompanyId) {
    return res.status(403).json({
      message: "Access denied: You can only access resources from your own company",
    });
  }

  if (req.method !== "GET" && !req.body.companyId) {
    req.body.companyId = userCompanyId;
  }

  next();
}
