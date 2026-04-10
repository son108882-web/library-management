const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔒 phải login mới mượn
router.post("/", authMiddleware, borrowController.borrowBook);

// 📋 lấy danh sách mượn
router.get("/", borrowController.getBorrows);

// 🔁 trả sách
router.put("/return/:id", borrowController.returnBook);

module.exports = router;