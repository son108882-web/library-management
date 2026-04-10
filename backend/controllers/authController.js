const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    await userModel.createUser(username, email, hashed);

    res.json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userModel.getUserByUsername(username);
    if (!user) return res.status(404).json({ error: "Không tồn tại" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Sai mật khẩu" });

    const token = jwt.sign({ id: user.id }, "secretkey", {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };