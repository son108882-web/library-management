const Book = require("../models/book");
const db = require("../models/db"); // Giữ db để chạy query thống kê nhanh

// 📚 Lấy tất cả sách
const getBooks = async (req, res) => {
  try {
    const rows = await Book.getAll();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Lấy 1 sách theo id
const getBookById = async (req, res) => {
  try {
    const book = await Book.getById(req.params.id);
    if (!book) return res.status(404).json({ error: "Không tìm thấy sách" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ Thêm sách (Khớp với Form giao diện của bạn)
const createBook = async (req, res) => {
  try {
    const { title, author, quantity, category, status } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: "Thiếu tiêu đề hoặc tác giả" });
    }

    await Book.create({ title, author, quantity, category, status });
    res.json({ message: "Thêm sách thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Cập nhật sách
const updateBook = async (req, res) => {
    try {
        const id = req.params.id;
        // Nếu có upload ảnh mới, lấy path ảnh, nếu không thì lấy data từ body
        const updateData = req.file 
            ? { ...req.body, image_url: `/uploads/${req.file.filename}` } 
            : req.body;

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "Dữ liệu gửi lên bị trống!" });
        }

        await Book.update(id, updateData); 
        res.json({ message: "Cập nhật thành công!", data: updateData });
    } catch (err) {
        console.error("Lỗi Update:", err);
        res.status(500).json({ error: err.message });
    }
};

// ❌ Xóa sách
const deleteBook = async (req, res) => {
  try {
    await Book.delete(req.params.id);
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 Thống kê: Sách mượn nhiều nhất
const topBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT books.title, COUNT(borrows.id) as total
      FROM borrows
      JOIN books ON borrows.book_id = books.id
      GROUP BY books.id
      ORDER BY total DESC LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🧊 Thống kê: Sách tồn lâu
const slowBooks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT books.title, IFNULL(COUNT(borrows.id), 0) as total
      FROM books
      LEFT JOIN borrows ON books.id = borrows.book_id
      GROUP BY books.id
      ORDER BY total ASC LIMIT 5
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  topBooks,
  slowBooks,
};