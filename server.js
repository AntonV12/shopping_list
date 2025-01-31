import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "./config/dotenv.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3008;
const __dirname = dirname(fileURLToPath(import.meta.url));

//app.use(express.static(path.join(__dirname, "client", "dist")));
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(cookieParser(process.env.ACCESS_TOKEN_SECRET));
app.use(cookieParser(process.env.REFRESH_TOKEN_SECRET));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);

/* app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
}); */

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
