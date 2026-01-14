import express from "express";
import cors from "cors";
import "dotenv/config";
import Routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5002;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  return res.json({ message: "product service is running" });
});

app.use(Routes);

app.listen(PORT, () => {
  console.log(`Product service is running on PORT ${PORT}`);
});

