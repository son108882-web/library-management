const db = require("../models/db");

const getStatistics = async (req, res) => {
  try {
    console.log("🔥 STATISTICS API RUNNING - UPDATING OVERDUE LOGIC");

    // 1. Tổng số sách
    const [books] = await db.query(
      "SELECT COUNT(*) AS totalBooks FROM books"
    );
    const totalBooks = books[0]?.totalBooks || 0;

    // 2. Đếm sách ĐANG MƯỢN (status = 'borrowed')
    const [borrowResult] = await db.query(
      "SELECT COUNT(*) AS borrowedBooks FROM borrows WHERE status = 'borrowed'"
    );
    const borrowedBooks = borrowResult[0]?.borrowedBooks || 0;

    // 3. Tổng thành viên
    const [users] = await db.query(
      "SELECT COUNT(*) AS newMembers FROM users"
    );
    const newMembers = users[0]?.newMembers || 0;

    // 4. 🔥 SỬA CHỖ NÀY: TÍNH TOÁN QUÁ HẠN THỰC TẾ
    // Lấy ngày hiện tại (YYYY-MM-DD) để so sánh với return_date trong DB
    const today = new Date().toISOString().split('T')[0]; 
    
    const [overdueResult] = await db.query(
      "SELECT COUNT(*) AS overdueBooks FROM borrows WHERE status = 'borrowed' AND return_date < ?",
      [today]
    );
    const overdueBooks = overdueResult[0]?.overdueBooks || 0;

    // 5. Hoạt động gần đây (Thêm return_date và status để Frontend hiển thị nhãn đỏ)
    const [activities] = await db.query(`
      SELECT 
        u.full_name AS memberName,
        bk.title AS bookTitle,
        b.borrow_date AS borrowDate,
        b.return_date AS returnDate,
        b.status AS status
      FROM borrows b
      JOIN users u ON b.user_id = u.id
      JOIN books bk ON b.book_id = bk.id
      ORDER BY b.borrow_date DESC
      LIMIT 10
    `);

    console.log("📊 RESULT:", { borrowedBooks, overdueBooks });

    res.json({
      totalBooks,
      borrowedBooks,
      newMembers,
      overdueBooks, // Trả về con số thực tế thay vì số 0 cứng nhắc
      recentActivities: activities
    });

  } catch (err) {
    console.error("STATISTICS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStatistics };