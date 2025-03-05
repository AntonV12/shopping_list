import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
//import { accessTokenSecret, refreshTokenSecret } from "../config/dotenv.js";
import { refreshAccessToken } from "../middlewares/refreshAccessToken.js";
export const accessTokenSecret = "access_secret";
export const refreshTokenSecret = "refresh_secret";

export const register = async (req, res) => {
  const { login, password, categories } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [existingUser] = await pool.execute("SELECT * FROM users WHERE login = ?", [login]);

    if (existingUser.length) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const sql = "INSERT INTO users (login, password, categories) VALUES (?, ?, ?)";
    const [results] = await pool.execute(sql, [login, hashedPassword, JSON.stringify(categories)]);

    res.status(201).json({ message: "Пользователь успешно зарегистрирован", results });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ error: "Ошибка регистрации" });
  }
};

export const login = async (req, res) => {
  const { login, password } = req.body;

  try {
    const [results] = await pool.execute("SELECT * FROM users WHERE login = ?", [login]);
    const user = results[0];

    if (!user) {
      return res.status(400).json({ error: "Неверный логин или пароль" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Неверный логин или пароль" });
    }

    const accessToken = jwt.sign({ id: user.id }, accessTokenSecret, {
      expiresIn: "20m",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 20,
    });

    let refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      refreshToken = jwt.sign({ id: user.id }, refreshTokenSecret, { expiresIn: "7d" });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    }

    res.json({
      user: { id: user.id, login: user.login },
      accessToken,
      refreshToken,
      message: "Успешный вход в систему",
    });
  } catch (err) {
    console.error("Ошибка при логине:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const currentUser = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    const decodedAccessToken = jwt.verify(accessToken, accessTokenSecret);
    res.status(200).json({ user: decodedAccessToken });
  } catch (err) {
    if (!refreshToken) {
      return res.status(401).json({ error: "Пользователь не авторизован" });
    }

    try {
      const newAccessToken = refreshAccessToken(refreshToken);
      const decodedRefreshToken = jwt.verify(refreshToken, refreshTokenSecret);

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 20,
      });

      res.status(200).json({ user: decodedRefreshToken });
    } catch {
      return res.status(401).json({ error: "Пользователь не авторизован" });
    }
  }
};

export const getUsers = async (req, res) => {
  try {
    const [results] = await pool.execute("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    console.error("Ошибка получения пользователей:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Успешный выход из системы" });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { categories } = req.body;

  try {
    const existingUser = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    const { login, password } = existingUser[0][0];
    const sql = "UPDATE users SET login = ?, password = ?, categories = ? WHERE id = ?";
    const [results] = await pool.execute(sql, [login, password, JSON.stringify(categories), id]);
    res.send({ id, login, categories });
  } catch (err) {
    console.error("Ошибка обновления пользователя:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const fetchUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await pool.execute("SELECT * FROM users WHERE id = ?", [id]);
    const { login, categories } = results[0];
    res.send({ id, login, categories });
  } catch (err) {
    console.error("Ошибка получения категорий пользователя:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
