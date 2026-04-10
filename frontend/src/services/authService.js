export const authService = {
  // 1. Hàm xử lý Đăng nhập
  login: (email) => {
    // Lấy danh sách người dùng đã đăng ký từ localStorage (nếu có)
    const users = JSON.parse(localStorage.getItem('library_users')) || [];
    
    // Tìm người dùng có email khớp
    const user = users.find(u => u.email === email);

    if (user) {
      // Nếu thấy, trả về tên người dùng (ví dụ: "quynh108862")
      return user.username;
    }
    
    // Nếu không thấy email trong danh sách đã đăng ký
    return null;
  },

  // 2. Hàm xử lý Đăng ký (Để dùng cho RegisterPage)
  register: (email, password) => {
    // Lấy danh sách cũ
    const users = JSON.parse(localStorage.getItem('library_users')) || [];

    // Kiểm tra xem email đã tồn tại chưa
    if (users.find(u => u.email === email)) {
      return { success: false, message: "Email này đã được đăng ký!" };
    }

    // Tạo username từ email (cắt bỏ phần @...)
    const username = email.split('@')[0];

    // Thêm người dùng mới vào danh sách
    const newUser = { email, password, username };
    users.push(newUser);

    // Lưu lại vào localStorage
    localStorage.setItem('library_users', JSON.stringify(users));

    return { success: true, username };
  },

  // 3. Hàm kiểm tra trạng thái đăng nhập nhanh
  getCurrentUser: () => {
    return localStorage.getItem('user');
  }
};