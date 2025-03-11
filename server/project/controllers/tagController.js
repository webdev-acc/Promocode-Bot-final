const pool = require("../config/db");

// Получение связей баннеров и тегов
const getBannerTags = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM banner_tag");
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении связей баннеров и тегов:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Получение уникальных тегов
const getTags = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT name, id FROM tags");
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении тегов:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Создание нового тега
const createTag = async (req, res) => {
  try {
    const { tag } = req.body;

    const existingTag = await pool.query("SELECT * FROM tags WHERE name = $1", [
      tag,
    ]);

    if (existingTag.rows.length > 0) {
      return res.status(400).json({ message: "Такой тег уже существует" });
    }

    const result = await pool.query(
      "INSERT INTO tags (name) VALUES ($1) RETURNING *",
      [tag]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка сервера:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTag = await pool.query("SELECT * FROM tags WHERE id = $1", [
      id,
    ]);

    if (existingTag.rows.length === 0) {
      return res.status(404).json({ message: "Тег с таким ID не найден" });
    }

    await pool.query("DELETE FROM tags WHERE id = $1", [id]);

    res.json({ message: "Тег успешно удален" });
  } catch (err) {
    console.error("Ошибка при удалении тега:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

module.exports = {
  getBannerTags,
  getTags,
  createTag,
  deleteTag,
};
