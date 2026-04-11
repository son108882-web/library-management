import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  User as UserIcon,
  LogOut
} from "lucide-react"; // Dùng icon cho đồng bộ
import { useNavigate } from "react-router-dom";

const API_HISTORY = "http://localhost:5000/api/borrows";

const ProfilePage = () => {
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
        <div className="p-10 bg-white rounded-[2rem] shadow-xl border border-white text-center">
          <p className="text-xl font-bold text-rose-500 mb-4 tracking-tight">⚠️ Bạn chưa đăng nhập!</p>
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const userName = user.name || user.username || user.full_name || "Thành viên";
  const userEmail = user.email || "Chưa có email";

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Profile Card - PHONG CÁCH MỚI TRẮNG SÁNG */}
        <div className="bg-white rounded-[2.5rem] p-10 mb-10 flex flex-col md:flex-row items-center gap-10 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
          {/* Decor background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50"></div>
          
          <div className="relative z-10 w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-5xl font-black shadow-lg shadow-indigo-200 transform hover:rotate-2 transition-transform">
            {userName.charAt(0).toUpperCase()}
          </div>
          
          <div className="relative z-10 text-center md:text-left flex-1">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">{userName}</h2>
            <p className="text-slate-400 text-lg font-medium mt-1">{userEmail}</p>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-xl border border-indigo-100 uppercase tracking-wider">
                <UserIcon size={14} /> Thành viên
              </span>
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black rounded-xl border border-emerald-100 uppercase tracking-wider">
                <ShieldCheck size={14} /> Đã xác minh
              </span>
            </div>
          </div>
        </div>

        {/* Lịch sử tiêu đề */}
        <div className="flex items-center justify-between mb-8 px-4">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <BookOpen size={20} />
            </div>
            Lịch sử mượn sách
          </h3>
          <span className="px-4 py-1 bg-white rounded-full border border-slate-200 text-slate-500 text-xs font-bold shadow-sm">
            {history.length} bản ghi
          </span>
        </div>

        {/* Bảng lịch sử - STYLE TRẮNG TINH KHÔI */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center p-24 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-400 font-bold tracking-tight">Đang đồng bộ dữ liệu...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin sách</th>
                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ngày mượn</th>
                    <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hạn trả/Ngày trả</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-all duration-200 group">
                        <td className="px-10 py-6">
                          <div className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors text-sm uppercase">
                            {item.book_title || item.title || item.bookTitle || "Chưa rõ tên"}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                                <Calendar size={14} className="text-slate-300" />
                                {isPending(item.status) ? "---" : formatDate(item.borrow_date || item.borrowDate)}
                            </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                                <Clock size={14} className="text-slate-300" />
                                {(item.return_date || item.returnDate) 
                                    ? formatDate(item.return_date || item.returnDate) 
                                    : <span className="text-slate-300 italic">Đang chờ...</span>}
                            </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border shadow-sm ${getStatusTailwind(item)}`}>
                            {getStatusText(item)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                             <BookOpen size={40} />
                          </div>
                          <p className="text-slate-400 font-bold text-lg">Bạn chưa mượn cuốn sách nào.</p>
                          <button 
                            onClick={() => navigate('/')}
                            className="text-indigo-600 font-black text-sm hover:underline"
                          >
                             Khám phá kho sách ngay →
                          </button>
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
  const dueDate = item.due_date || item.dueDate || item.return_date || item.returnDate;
  if (!dueDate || item.status === "returned" || item.status === "đã trả") return false;
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
  if (status === "returned" || status === "đã trả") return "bg-emerald-50 text-emerald-600 border-emerald-100";
  if (isOverdue(item)) return "bg-rose-50 text-rose-600 border-rose-100 animate-pulse";
  if (status === "approved" || status === "borrowed" || status === "đang mượn") return "bg-blue-50 text-blue-600 border-blue-100";
  return "bg-amber-50 text-amber-600 border-amber-100";
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
};

export default ProfilePage;