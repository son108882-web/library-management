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
}).promise();

db.getConnection()
    .then(connection => {
        console.log("✅ Đã kết nối MySQL thông qua Pool!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Không thể kết nối MySQL. Hãy kiểm tra XAMPP:", err.message);
    });

// --- 2. CẤU HÌNH MULTER ---
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 3. MIDDLEWARE & CORS ---
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

// API thêm sách
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

// 2. API Thực hiện mượn sách mới (Cập nhật: Giảm số lượng quantity)
app.post('/api/borrows', async (req, res) => {
    const { user_id, book_id, return_date } = req.body;
    if (!user_id || !book_id) {
        return res.status(400).json({ error: "Thiếu thông tin người dùng hoặc sách!" });
    }
    
    try {
        // Kiểm tra xem sách còn trong kho không
        const [rows] = await db.query("SELECT quantity, title FROM books WHERE id = ?", [book_id]);
        if (rows.length === 0) return res.status(404).json({ error: "Sách không tồn tại" });
        
        const currentQty = rows[0].quantity;
        if (currentQty <= 0) {
            return res.status(400).json({ error: "Sách này hiện đã hết trong kho!" });
        }

        const finalReturnDate = return_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Bắt đầu thực hiện mượn
        const [result] = await db.query(
            "INSERT INTO borrows (user_id, book_id, borrow_date, return_date, status) VALUES (?, ?, CURDATE(), ?, 'borrowed')", 
            [user_id, book_id, finalReturnDate]
        );
        
        // LOGIC CHÍNH: Giảm số lượng và tự động cập nhật status nếu hết sách
        await db.query(`
            UPDATE books 
            SET quantity = quantity - 1,
                status = CASE WHEN (quantity - 1) <= 0 THEN 'out_of_stock' ELSE 'available' END
            WHERE id = ?
        `, [book_id]);
        
        console.log(`✅ User ${user_id} mượn "${rows[0].title}". Kho còn: ${currentQty - 1}`);
        res.json({ success: true, message: "Mượn sách thành công!", id: result.insertId });
    } catch (err) {
        console.error("❌ Lỗi mượn sách:", err);
        res.status(500).json({ error: err.message });
    }
});

// 3. API Thực hiện trả sách (Cập nhật: Tăng lại số lượng quantity)
app.put('/api/borrows/return/:id', async (req, res) => {
    const borrowId = req.params.id;
    try {
        const [rows] = await db.query("SELECT book_id FROM borrows WHERE id = ?", [borrowId]);
        if (rows.length === 0) return res.status(404).json({ error: "Không tìm thấy phiếu mượn" });
        
        const bookId = rows[0].book_id;
        
        // Cập nhật trạng thái phiếu mượn
        await db.query("UPDATE borrows SET status = 'returned', return_date = CURDATE() WHERE id = ?", [borrowId]);
        
        // LOGIC CHÍNH: Tăng lại số lượng vào kho và set trạng thái thành available
        await db.query(`
            UPDATE books 
            SET quantity = quantity + 1, 
                status = 'available' 
            WHERE id = ?
        `, [bookId]);

        res.json({ success: true, message: "Trả sách thành công, kho đã được cập nhật!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. ROUTE TÁCH BIỆT ---
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
    console.log(`🚀 Server backend chuẩn N5 BOOK port ${PORT}!`);
});

module.exports = { db };