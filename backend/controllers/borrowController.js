const db = require("../models/db");

// 📚 mượn sách
const borrowBook = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    // ✅ 1. CHECK USER ĐÃ MƯỢN CHƯA (chưa trả)
    const [existing] = await db.query(
      "SELECT * FROM borrows WHERE user_id = ? AND return_date IS NULL",
      [user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "Bạn đã mượn 1 sách rồi, hãy trả trước!"
      });
    }

    // ✅ 2. CHECK SÁCH
    const [book] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [book_id]
    );

    if (!book[0] || book[0].quantity < 1) {
      return res.status(400).json({
        error: "Sách không có sẵn"
      });
    }

    // ✅ 3. INSERT BORROW
    await db.query(
      "INSERT INTO borrows (user_id, book_id, borrow_date) VALUES (?, ?, NOW())",
      [user_id, book_id]
    );

    // ✅ 4. GIẢM SỐ LƯỢNG
    await db.query(
      "UPDATE books SET quantity = quantity - 1 WHERE id = ?",
      [book_id]
    );

    res.json({ message: "Mượn sách thành công" });

  } catch (err) {
    console.error("Borrow error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 🔁 trả sách
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;

    const [borrow] = await db.query(
      "SELECT * FROM borrows WHERE id = ?",
      [id]
    );

    if (!borrow[0]) {
      return res.status(404).json({ error: "Không tìm thấy" });
    }

    // ✅ CHECK ĐÃ TRẢ CHƯA
    if (borrow[0].return_date) {
      return res.status(400).json({
        error: "Sách này đã được trả rồi"
      });
    }

    // ✅ UPDATE RETURN DATE
    await db.query(
      "UPDATE borrows SET return_date = NOW() WHERE id = ?",
      [id]
    );

    // ✅ CỘNG LẠI SỐ LƯỢNG
    await db.query(
      "UPDATE books SET quantity = quantity + 1 WHERE id = ?",
      [borrow[0].book_id]
    );

    res.json({ message: "Trả sách thành công" });

  } catch (err) {
    console.error("Return error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 📋 lấy danh sách mượn
const getBorrows = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        b.id, 
        u.name AS user_name, 
        bk.title AS book_title, 
        b.borrow_date, 
        b.return_date
      FROM borrows b
      JOIN users u ON b.user_id = u.id
      JOIN books bk ON b.book_id = bk.id
      ORDER BY b.borrow_date DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("Get borrows error:", err);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  borrowBook,
  returnBook,
  getBorrows
};