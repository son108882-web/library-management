import React, { useEffect, useState } from "react";
import axios from "axios";

const API_HISTORY = "http://localhost:5000/api/borrows";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) return;

        // ✅ Lấy ID linh hoạt: thử mọi trường hợp có thể tồn tại
        const userId = userData.id || userData.user?.id || userData.userId;

        if (userId) {
          const res = await axios.get(`${API_HISTORY}?user_id=${userId}`);
          // ✅ Kiểm tra chắc chắn là mảng mới set
          setHistory(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (!user) return <div style={{ padding: 50, textAlign: 'center' }}>⚠️ Bạn chưa đăng nhập!</div>;

  // ✅ FIX: Lấy tên và email linh hoạt (tránh bị undefined)
  const userName = user.name || user.username || user.full_name || "Thành viên";
  const userEmail = user.email || "Chưa có email";

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👤 Thông tin cá nhân</h2>

      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {userName.charAt(0).toUpperCase()}
        </div>

        <div>
          <p style={{ margin: "5px 0" }}><strong>Tên:</strong> {userName}</p>
          <p style={{ margin: "5px 0" }}><strong>Email:</strong> {userEmail}</p>
        </div>
      </div>

      <h3 style={styles.subtitle}>📚 Lịch sử mượn sách</h3>

      <div style={styles.tableWrapper}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải lịch sử...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tên sách</th>
                <th style={styles.th}>Ngày mượn</th>
                <th style={styles.th}>Hạn trả</th>
                <th style={styles.th}>Ngày trả</th>
                <th style={styles.th}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id}>
                    {/* ✅ Lấy tên sách linh hoạt */}
                    <td style={styles.td}>
                      {item.book_title || item.title || item.bookTitle || "N/A"}
                    </td>

                    {/* Ngày mượn */}
                    <td style={styles.td}>
                      {isPending(item.status) ? "---" : formatDate(item.borrow_date || item.borrowDate)}
                    </td>

                    {/* Hạn trả */}
                    <td style={styles.td}>
                      {isPending(item.status) ? "---" : formatDate(item.due_date || item.dueDate)}
                    </td>

                    {/* Ngày trả thực tế */}
                    <td style={styles.td}>
                      {(item.return_date || item.returnDate) 
                        ? formatDate(item.return_date || item.returnDate) 
                        : "---"}
                    </td>

                    {/* Trạng thái */}
                    <td style={styles.td}>
                      <span style={getStatusStyle(item)}>
                        {getStatusText(item)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.empty}>Bạn chưa có lịch sử mượn sách nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// --- CÁC HÀM HELPER GIỮ NGUYÊN LOGIC CỦA BẠN ---
const isPending = (status) => status === "pending" || status === "chờ duyệt";

const isOverdue = (item) => {
  const dueDate = item.due_date || item.dueDate;
  if (!dueDate || item.return_date || item.returnDate || item.status === "returned") return false;
  return new Date() > new Date(dueDate);
};

const getStatusText = (item) => {
  const status = item.status?.toLowerCase();
  if (status === "pending") return "Chờ duyệt";
  if (isOverdue(item)) return "Quá hạn";
  if (status === "approved" || status === "borrowed") return "Đang mượn";
  if (status === "returned") return "Đã trả";
  return item.status || "N/A";
};

const getStatusStyle = (item) => {
  const status = item.status?.toLowerCase();
  if (status === "returned") return { color: "#2ecc71", fontWeight: "bold" };
  if (isOverdue(item)) return { color: "#e74c3c", fontWeight: "bold" };
  if (status === "approved" || status === "borrowed") return { color: "#3498db", fontWeight: "bold" };
  return { color: "#f39c12", fontWeight: "bold" };
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

const styles = {
  container: { padding: "40px", background: "#f4f6f9", minHeight: "100vh" },
  title: { marginBottom: "15px", fontSize: "24px", color: "#2c3e50" },
  profileCard: { display: "flex", alignItems: "center", gap: "20px", background: "white", padding: "20px", borderRadius: "12px", marginBottom: "30px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" },
  avatar: { width: "70px", height: "70px", borderRadius: "50%", background: "#4b6cb7", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold" },
  subtitle: { marginBottom: "15px", fontSize: "20px", color: "#2c3e50" },
  tableWrapper: { background: "white", borderRadius: "12px", padding: "15px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  th: { padding: "12px", background: "#f8f9fa", textAlign: "center", fontWeight: "bold", borderBottom: "2px solid #eee" },
  td: { padding: "15px", borderBottom: "1px solid #eee", textAlign: "center", color: "#444" },
  empty: { padding: "40px", textAlign: "center", color: "#999", fontSize: "16px" }
};

export default ProfilePage;