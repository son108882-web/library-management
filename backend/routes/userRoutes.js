const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// 1. Lấy danh sách thành viên (GET)
router.get("/", userController.getUsers);

// 2. Đăng nhập
router.post("/login", userController.login);

// 3. Đăng ký (Sửa từ "/" thành "/register" để khớp với React)
router.post("/register", userController.addUser);

// 4. Thêm thành viên mới (Giữ nguyên cái này nếu Admin dùng)
router.post("/", userController.addUser);

// 5. Cập nhật & Xóa
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;