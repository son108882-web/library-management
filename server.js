const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// --- 1. CẤU HÌNH KẾT NỐI DATABASE ---
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", 
    database: "library_db",
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Bắt buộc để Controller dùng await

// Kiểm tra trạng thái kết nối (Sửa lại cho chuẩn Promise)
db.getConnection()
    .then(connection => {
        console.log("✅ Đã kết nối MySQL thông qua Pool!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Không thể kết nối MySQL. Hãy kiểm tra XAMPP:", err.message);
    });

// --- 2. CẤU HÌNH MULTER (XỬ LÝ UPLOAD ẢNH) ---
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Đã tạo thư mục lưu trữ ảnh tại:", uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 3. CẤU HÌNH MIDDLEWARE & CORS ---
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// --- 4. CÁC API CHÍNH ---

// API thêm sách (Sử dụng async/await cho đồng bộ với .promise())
app.post('/api/books', upload.single('image'), async (req, res) => {
    const { title, author, category, quantity, status, description } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const q = "INSERT INTO books (title, author, category, quantity, status, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)";
    try {
        const [result] = await db.query(q, [title, author, category, quantity, status, description, image_url]);
        res.json({ message: "Thêm sách thành công!", id: result.insertId });
    } catch (err) {
        console.error("❌ Lỗi khi thêm sách:", err);
        res.status(500).json(err);
    }
});

// --- 4.5 API QUẢN LÝ MƯỢN TRẢ (BORROWS) ---

// 1. Lấy toàn bộ danh sách mượn trả
app.get('/api/borrows', async (req, res) => {
    const q = `
        SELECT 
            br.id,
            u.full_name as memberName,
            u.email as memberEmail,
            b.title as bookTitle,
            br.borrow_date as borrowDate,
            br.return_date as returnDate,
            br.status
        FROM borrows br
        JOIN users u ON br.user_id = u.id
        JOIN books b ON br.book_id = b.id
        ORDER BY br.borrow_date DESC
    `;
    try {
        const [results] = await db.query(q);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. API Thực hiện mượn sách mới
app.post('/api/borrows', async (req, res) => {
    const { user_id, book_id, return_date } = req.body;
    if (!user_id || !book_id) {
        return res.status(400).json({ error: "Thiếu thông tin người dùng hoặc sách!" });
    }
    
    try {
        const [rows] = await db.query("SELECT status FROM books WHERE id = ?", [book_id]);
        if (rows.length === 0) return res.status(404).json({ error: "Sách không tồn tại" });
        if (rows[0].status === 'borrowed' || rows[0].status === 'out_of_stock') {
            return res.status(400).json({ error: "Sách hiện đã có người mượn!" });
        }

        const finalReturnDate = return_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const [result] = await db.query("INSERT INTO borrows (user_id, book_id, borrow_date, return_date, status) VALUES (?, ?, CURDATE(), ?, 'borrowed')", [user_id, book_id, finalReturnDate]);
        
        await db.query("UPDATE books SET status = 'borrowed' WHERE id = ?", [book_id]);
        
        console.log(`✅ User ${user_id} đã mượn sách ${book_id}`);
        res.json({ message: "Mượn sách thành công!", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. API Thực hiện trả sách
app.put('/api/borrows/return/:id', async (req, res) => {
    const borrowId = req.params.id;
    try {
        const [rows] = await db.query("SELECT book_id FROM borrows WHERE id = ?", [borrowId]);
        if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy phiếu mượn" });
        
        const bookId = rows[0].book_id;
        await db.query("UPDATE borrows SET status = 'returned', return_date = CURDATE() WHERE id = ?", [borrowId]);
        await db.query("UPDATE books SET status = 'available' WHERE id = ?", [bookId]);
        res.json({ message: "Trả sách thành công!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. ĐĂNG KÝ CÁC ROUTE TÁCH BIỆT (KHAI BÁO DUY NHẤT 1 LẦN) ---
const categoryRoutes = require("./backend/routes/categoryRoutes");
const userRoutes = require("./backend/routes/userRoutes");
const bookRoutes = require("./backend/routes/bookRoutes");
const statisticsRoutes = require("./backend/routes/statisticsRoutes");

app.use("/api/categories", categoryRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

// --- 6. KHỞI CHẠY SERVER ---
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server backend chuẩn N5 BOOK port ${PORT}!`);
    console.log(`📂 Static Uploads: http://localhost:${PORT}/uploads`);
    console.log(`📂 API Statistics: http://localhost:${PORT}/api/statistics`);
    console.log(`-----------------------------------------`);
});

// Export để Controllers dùng
module.exports = { db };