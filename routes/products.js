import express from "express";
import { authenticateUser } from "../middlewares/authenticateUser.js";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateProducts,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/add", authenticateUser, addProduct);
router.get("/fetch/:id", getProducts);
router.put("/update/:id", authenticateUser, updateProduct);
router.delete("/delete/:id", authenticateUser, deleteProduct);
router.put("/update/", authenticateUser, updateProducts);

export default router;
