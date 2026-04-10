const db = require("./db");

const borrowBook = async (user_id, book_id) => {
  const [result] = await db.query(
    "INSERT INTO borrows (user_id, book_id) VALUES (?, ?)",
    [user_id, book_id]
  );
  return result;
};

const getBorrowList = async () => {
  const [rows] = await db.query(`
    SELECT borrows.*, users.username, books.title
    FROM borrows
    JOIN users ON borrows.user_id = users.id
    JOIN books ON borrows.book_id = books.id
  `);
  return rows;
};

module.exports = {
  borrowBook,
  getBorrowList,
};