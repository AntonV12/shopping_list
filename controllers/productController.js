import { pool } from "../config/database.js";

export const addProduct = async (req, res) => {
  const { id, name, category, checked, author_id } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: "Название и категория продукта обязательны" });
  }

  try {
    const [existingProduct] = await pool.execute("SELECT * FROM products WHERE name = ? AND author_id = ?", [
      name,
      author_id,
    ]);

    if (existingProduct.length) {
      return res.status(400).json({ error: "Продукт уже добавлен в список" });
    }

    const sql = `INSERT INTO products (id, name, category, checked, author_id) VALUES (?, ?, ?, ?, ?)`;
    const [results] = await pool.execute(sql, [id, name, category, checked, author_id]);
    const { insertId } = results;
    const insertedProduct = { id: insertId, name, category, checked, author_id };
    res.send(insertedProduct);
  } catch (err) {
    console.error("Ошибка при добавлении продукта", err);
    res.status(500).json({ error: "Ошибка при добавлении продукта" });
  }
};

export const getProducts = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await pool.execute("SELECT * FROM products WHERE author_id = ?", [id]);
    res.send(results);
  } catch (err) {
    console.error("Ошибка при получении списка продуктов", err);
    res.status(500).send("Ошибка при получении списка продуктов");
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, checked, author_id } = req.body;

  try {
    const sql = "UPDATE products SET name = ?, category = ?, checked = ?, author_id = ? WHERE author_id = ? AND id = ?";
    const [results] = await pool.execute(sql, [name, category, checked, author_id, author_id, id]);
    res.send({ id, name, category, checked, author_id });
  } catch (err) {
    console.error("Ошибка при обновлении продукта", err);
    res.status(500).send("Ошибка при обновлении продукта");
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = "DELETE FROM products WHERE id = ?";
    const [results] = await pool.execute(sql, [id]);
    res.send(id);
  } catch (err) {
    console.error("Ошибка при удалении продукта", err);
    res.status(500).send("Ошибка при удалении продукта");
  }
};

export const updateProducts = async (req, res) => {
  const { products } = req.body;

  try {
    for (const product of products) {
      const { id, name, category, checked, author_id } = product;
      const sql =
        "UPDATE products SET name = ?, category = ?, checked = ?, author_id = ? WHERE author_id = ? AND id = ?";
      const [results] = await pool.execute(sql, [name, category, checked, author_id, author_id, id]);
    }
    res.send(products);
  } catch (err) {
    console.error("Ошибка при обновлении продуктов", err);
    res.status(500).send("Ошибка при обновлении продуктов");
  }
};
