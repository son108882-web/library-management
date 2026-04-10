const db = require("./db");

const Book = {
  // Lấy tất cả sách
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM books");
    return rows;
  },

  // Tìm sách theo ID
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM books WHERE id = ?", [id]);
    return rows[0];
  },

  // Thêm sách mới (Đã thêm category và status cho khớp giao diện)
  create: async (data) => {
    const { title, author, quantity, category, status } = data;
    const [result] = await db.query(
      "INSERT INTO books (title, author, quantity, category, status) VALUES (?, ?, ?, ?, ?)",
      [title, author, quantity || 0, category || "Chưa rõ", status || "available"]
    );
    return result;
  },

  // Cập nhật sách
  update: async (id, data) => {
    const { title, author, quantity, category, status } = data;
    const [result] = await db.query(
      "UPDATE books SET title = ?, author = ?, quantity = ?, category = ?, status = ? WHERE id = ?",
      [title, author, quantity, category, status, id]
    );
    return result;
  },

  // Xóa sách
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);
    return result;
  }
};

module.exports = Book;