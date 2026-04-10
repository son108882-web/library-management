const db = require("./db");

// 🔍 lấy tất cả user
const getAllUsers = async () => {
  const [rows] = await db.query("SELECT * FROM users");
  return rows;
};

// 🔍 tìm user theo username
const getUserByUsername = async (username) => {
  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  return rows[0];
};

// ➕ tạo user (đúng chuẩn DB của bạn: có email)
const createUser = async (username, email, password) => {
  const [result] = await db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password]
  );
  return result;
};

module.exports = {
  getAllUsers,
  getUserByUsername,
  createUser,
};