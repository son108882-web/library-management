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
      if (!user) return;
      try {
        setLoading(true);
        const userId = user.id || user.user?.id || user.userId;
        if (userId) {
          const res = await axios.get(`${API_HISTORY}`, {
            params: { user_id: userId } 
          });
          setHistory(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error("Lỗi lấy lịch sử:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="p-8 bg-[#1e1e1e] rounded-xl border border-gray-800">
          <p className="text-xl font-semibold text-red-500 text-center">⚠️ Bạn chưa đăng nhập!</p>
        </div>
      </div>
    );
  }

  const userName = user.name || user.username || user.full_name || "Thành viên";
  const userEmail = user.email || "Chưa có email";

  return (
    <div className="min-h-screen bg-[#0f1113] text-gray-200 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-[#1a1d21] rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8 border border-gray-800/50 shadow-2xl">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-black shadow-lg transform hover:rotate-3 transition-transform">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{userName}</h2>
            <p className="text-gray-400 text-lg mt-1">{userEmail}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20 uppercase tracking-wider">
                Thành viên
              </span>
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Đã xác minh
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            Lịch sử mượn sách
          </h3>
          <span className="text-gray-500 text-sm font-medium">{history.length} bản ghi</span>
        </div>

        {/* Bảng lịch sử */}
        <div className="bg-[#1a1d21] rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center p-24 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400 font-medium">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#23272d] border-b border-gray-800">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em]">Tên sách</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] text-center">Ngày mượn</th>
                    <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] text-center">Ngày trả</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-[0.1em] text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-800/30 transition-all duration-200 group">
                        <td className="px-8 py-5">
                          <div className="font-bold text-gray-100 group-hover:text-indigo-400 transition-colors uppercase text-sm">
                            {item.book_title || item.title || item.bookTitle || "Chưa rõ tên"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-gray-400 tabular-nums">
                          {isPending(item.status) ? "---" : formatDate(item.borrow_date || item.borrowDate)}
                        </td>
                        <td className="px-6 py-5 text-center text-gray-400 tabular-nums">
                          {(item.return_date || item.returnDate) 
                            ? formatDate(item.return_date || item.returnDate) 
                            : <span className="text-gray-600 italic">Chưa trả</span>}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${getStatusTailwind(item)}`}>
                            {getStatusText(item)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="text-gray-700 text-6xl mb-2 font-bold opacity-20 uppercase tracking-tighter">Trống</div>
                          <p className="text-gray-500 font-medium">Bạn chưa thực hiện bất kỳ giao dịch mượn sách nào.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HELPER FUNCTIONS ---
const isPending = (status) => status === "pending" || status === "chờ duyệt";

const isOverdue = (item) => {
  const dueDate = item.due_date || item.dueDate;
  if (!dueDate || item.return_date || item.returnDate || item.status === "returned") return false;
  return new Date() > new Date(dueDate);
};

const getStatusText = (item) => {
  const status = item.status?.toLowerCase();
  if (status === "pending" || status === "chờ duyệt") return "CHỜ DUYỆT";
  if (isOverdue(item)) return "QUÁ HẠN";
  if (status === "approved" || status === "borrowed" || status === "đang mượn") return "ĐANG MƯỢN";
  if (status === "returned" || status === "đã trả") return "ĐÃ TRẢ";
  return item.status?.toUpperCase() || "KHÔNG RÕ";
};

const getStatusTailwind = (item) => {
  const status = item.status?.toLowerCase();
  if (status === "returned" || status === "đã trả") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (isOverdue(item)) return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  if (status === "approved" || status === "borrowed" || status === "đang mượn") return "bg-sky-500/10 text-sky-500 border-sky-500/20";
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

export default ProfilePage;