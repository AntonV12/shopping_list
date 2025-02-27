import express from "express";
import { register, login, logout, currentUser, getUsers, updateUser } from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/current-user", currentUser);
router.get("/users", getUsers);
router.put("/users/:id", authenticateUser, updateUser);

export default router;
