const API_URL = "http://localhost:5000/api/books"; // Kiểm tra lại port backend của bạn

const bookService = {
  // Lấy danh sách tất cả sách
  getAllBooks: async () => {
    const response = await fetch(API_URL);
    return await response.json();
  },

  // Thêm sách mới
  addBook: async (bookData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });
    return await response.json();
  },

  // Cập nhật thông tin sách
  updateBook: async (id, bookData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    });
    return await response.json();
  },

  // Xóa sách
  deleteBook: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    return await response.json();
  },

  // Thống kê sách mượn nhiều
  getTopBooks: async () => {
    const response = await fetch(`${API_URL}/top`);
    return await response.json();
  },

  // Thống kê sách tồn lâu
  getSlowBooks: async () => {
    const response = await fetch(`${API_URL}/slow`);
    return await response.json();
  }
};

export default bookService;