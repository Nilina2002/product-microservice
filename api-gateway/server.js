import express from "express";
import cors from "cors";
import "dotenv/config";
import axios from "axios";
import jwt from "jsonwebtoken";

const app = express();
const PORT = process.env.PORT || 5000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001/api";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002/api";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.json({ message: "API Gateway is running" });
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    return res.status(401).json({ message: "Token format is invalid" });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
}

async function forwardRequest(targetBaseUrl, req, res, pathPrefix) {
  try {
    const url = targetBaseUrl + req.path.replace(pathPrefix, "");

    const response = await axios({
      method: req.method,
      url: url,
      headers: {
        ...req.headers,
      },
      data: req.body,
      params: req.query,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data);
    }
    console.error(error.message);
    return res.status(500).json({ message: "Something went wrong in gateway" });
  }
}

app.use("/auth", async (req, res) => {
  await forwardRequest(AUTH_SERVICE_URL, req, res, "/auth");
});

app.use("/products", authMiddleware, async (req, res) => {
  await forwardRequest(PRODUCT_SERVICE_URL, req, res, "/products");
});

app.use("/stock", authMiddleware, async (req, res) => {
  await forwardRequest(PRODUCT_SERVICE_URL, req, res, "/stock");
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on PORT ${PORT}`);
});

