const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ ảnh giống hệt server.js để đồng bộ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../public/uploads')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- CÁC ROUTE ---

// Thống kê
router.get("/top", bookController.topBooks);
router.get("/slow", bookController.slowBooks);

// Lấy danh sách & Chi tiết
router.get("/", bookController.getBooks);
router.get("/:id", bookController.getBookById);

// Thêm sách (Dùng upload.single để nhận file)
router.post("/", upload.single('image'), bookController.createBook);

// CẬP NHẬT SÁCH (Quan trọng: Phải có upload.single để không bị undefined req.body)
router.put("/:id", upload.single('image'), bookController.updateBook);

// Xóa
router.delete("/:id", bookController.deleteBook);

module.exports = router;