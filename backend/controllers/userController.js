const db = require("../models/db");

// 1. Lấy danh sách thành viên
exports.getUsers = async (req, res) => {
    try {
        const [results] = await db.query("SELECT id, username, email, full_name, role, status FROM users ORDER BY id DESC");
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};

// 2. Thêm thành viên mới
// 2. Thêm thành viên mới (Dùng cho cả Đăng ký và Admin thêm user)
exports.addUser = async (req, res) => {
  try {
    // Lấy đúng các trường từ form React gửi lên
    const { username, email, password, name, role } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ message: "Email và mật khẩu không được để trống" });
    }

    // Kiểm tra trùng lặp email
    const [existingUser] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email này đã được đăng ký!" });
    }

    const sql = "INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)";
    
    // Ưu tiên username từ form, nếu không có mới cắt từ email
    const finalUsername = username || email.split('@')[0]; 
    const finalPassword = password; // Lấy pass người dùng nhập thay vì '123'
    const finalFullName = name || finalUsername;
    const userRole = role || 'user';
    const status = 'active';

    const [result] = await db.execute(sql, [finalUsername, email, finalPassword, finalFullName, userRole, status]);
    
    res.status(201).json({ 
      message: "Đăng ký thành công!", 
      id: result.insertId 
    });
  } catch (err) {
    console.error("Lỗi thêm user:", err);
    res.status(500).json({ message: "Lỗi Database: " + err.message });
  }
};

// 3. Cập nhật thành viên (Cho cả Sửa và Khóa/Mở khóa)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, role, status, username } = req.body;
        
        // Dùng COALESCE hoặc gán giá trị cũ nếu không gửi lên để tránh mất data
        const sql = "UPDATE users SET full_name = ?, email = ?, role = ?, status = ? WHERE id = ?";
        await db.execute(sql, [full_name, email, role, status, id]);
        
        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
        res.status(500).json({ message: "Lỗi cập nhật", error: err.message });
    }
};

// 4. Xóa thành viên
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "Đã xóa thành viên!" });
    } catch (err) {
        console.error("Lỗi xóa:", err);
        res.status(500).json({ message: "Lỗi xóa", error: err.message });
    }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user trong DB
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Sai email hoặc mật khẩu" });
    }

    const user = users[0];

    // trả về đúng format cho frontend
    res.json({
      user: {
        id: user.id,
        name: user.full_name || user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Lỗi login:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};