const pool = require("../config/db");

// Создание нового пользователя
const createUser = async (req, res) => {
  try {
    const { userName: name, email, role } = req.body;
    const validRoles = ["admin", "user", "moderator"]; // список допустимых ролей

    if (!name) {
      return res.status(400).json({ message: "Напишите никнейм пользователя" });
    }

    if (!email) {
      return res.status(400).json({ message: "Напишите email пользователя" });
    }

    if (!role) {
      return res.status(400).json({ message: "Выберите роль пользователя" });
    }

    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ message: "Недопустимая роль пользователя" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE name = $1 AND email = $2",
      [name, email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Такой пользователь уже существует" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *",
      [name, email, role]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка сервера", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Обновление пользователя (добавление tg_id)
const updateUser = async (req, res) => {
  try {
    const { userName: name, tg_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Напишите никнейм пользователя" });
    }

    if (!tg_id) {
      return res.status(400).json({ message: "Напишите tg_id пользователя" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE name = $1",
      [name]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const result = await pool.query(
      "UPDATE users SET tg_id = $1 WHERE name = $2 RETURNING *",
      [tg_id, name]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Не удалось обновить tg_id" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка сервера", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Удаление пользователя по имени
const deleteUser = async (req, res) => {
  try {
    const { name } = req.params;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE name = $1",
      [name]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    await pool.query("DELETE FROM users WHERE name = $1", [name]);

    res.json({ message: "Пользователь успешно удален" });
  } catch (err) {
    console.error("Ошибка при удалении пользователя:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Получение списка всех пользователей
const getUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении списка пользователей:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Проверка доступа пользователя по имени или tg_id
const checkUserAccess = async (req, res) => {
  try {
    const { name, id } = req.params;

    if (!name) {
      return res.status(400).json({ message: "Параметр name обязателен" });
    }

    const result = await pool.query(
      "SELECT tg_id, name, role FROM users WHERE name = $1 OR tg_id = $2 LIMIT 1",
      [name, id]
    );

    if (result.rows.length > 0) {
      res.json({
        exists: true,
        role: result.rows[0].role,
      });
    } else {
      res.json({
        exists: false,
        user: null,
      });
    }
  } catch (err) {
    console.error("Ошибка при проверке пользователя:", err.message);
    res.status(500).send("Ошибка сервера");
  }
};
module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUsers,
  checkUserAccess,
};
