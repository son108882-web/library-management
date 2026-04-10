// Trỏ thẳng vào file db.js trong cùng thư mục models
const db = require("../models/db"); 

const getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories ORDER BY id DESC");
        res.json(rows);
    } catch (err) {
        console.error("❌ SQL Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

const createCategory = async (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Tên thể loại là bắt buộc" });
    try {
        await db.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);
        res.json({ message: "Thêm thể loại thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM categories WHERE id = ?", [id]);
        res.json({ message: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllCategories, createCategory, deleteCategory };