import { refreshTokenSecret, accessTokenSecret } from "../config/dotenv.js";
import jwt from "jsonwebtoken";

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, refreshTokenSecret);
    const newAccessToken = jwt.sign({ id: decoded.id }, accessTokenSecret, { expiresIn: "20m" });
    return newAccessToken;
  } catch (err) {
    console.error("Error in refreshAccessToken:", err.message);
    throw new Error("Недействительный refreshToken");
  }
};
