const db = require("../models/db");

const getStatistics = async (req, res) => {
  try {
    console.log("🔥 STATISTICS API RUNNING");

    // 1. Tổng số sách
    const [books] = await db.query(
      "SELECT COUNT(*) AS totalBooks FROM books"
    );
    const totalBooks = books[0]?.totalBooks || 0;

    // 2. 🔥 CHỈ ĐẾM SÁCH ĐANG MƯỢN
    const [borrowResult] = await db.query(
      "SELECT COUNT(*) AS borrowedBooks FROM borrows WHERE status = 'borrowed'"
    );
    const borrowedBooks = borrowResult[0]?.borrowedBooks || 0;

    // 3. Tổng thành viên
    const [users] = await db.query(
      "SELECT COUNT(*) AS newMembers FROM users"
    );
    const newMembers = users[0]?.newMembers || 0;

    // 4. Hoạt động gần đây
    const [activities] = await db.query(`
      SELECT 
        u.full_name AS memberName,
        bk.title AS bookTitle,
        b.borrow_date AS borrowDate
      FROM borrows b
      JOIN users u ON b.user_id = u.id
      JOIN books bk ON b.book_id = bk.id
      ORDER BY b.borrow_date DESC
      LIMIT 5
    `);

    console.log("BORROWED COUNT:", borrowedBooks);

    res.json({
      totalBooks,
      borrowedBooks,
      newMembers,
      overdueBooks: 0,
      recentActivities: activities
    });

  } catch (err) {
    console.error("STATISTICS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStatistics };