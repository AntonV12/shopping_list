import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;

  try {
    if (accessToken) {
      req.user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      return next();
    }

    if (refreshToken) {
      const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const newAccessToken = jwt.sign({ id: decodedRefreshToken.id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "20m",
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 20,
      });

      req.user = decodedRefreshToken;
      return next();
    }

    throw new Error("Токен отсутствует");
  } catch (err) {
    console.error("Ошибка аутентификации:", err);
    return res.status(401).json({ error: "Пользователь не авторизован" });
  }
};
