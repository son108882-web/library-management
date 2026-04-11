import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  History, Search, CheckCircle, Clock, 
  RotateCcw, User, Book as BookIcon, ArrowLeft, AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/borrows';

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      setHistory(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReturn = async (id) => {
    if (window.confirm("Xác nhận độc giả đã trả cuốn sách này?")) {
      try {
        await axios.put(`${API_URL}/return/${id}`);
        alert("Đã cập nhật trạng thái trả sách thành công!");
        fetchHistory();
      } catch (error) {
        alert("Lỗi khi xử lý trả sách");
        console.error(error);
      }
    }
  };

  // 🔥 GIỮ NGUYÊN LOGIC CŨ VÀ SORT MỚI NHẤT LÊN ĐẦU
  const filteredData = history
    .filter(item => 
      (item.memberName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.bookTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen bg-[#0f1113] text-gray-200 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="p-3 bg-[#1a1d21] hover:bg-indigo-600 text-gray-400 hover:text-white rounded-2xl border border-gray-800 transition-all shadow-lg group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div>
              <h1 className="text-3xl font-black text-white">Quản lý Mượn & Trả</h1>
              <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Hệ thống lưu thông sách trực tuyến
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm tên độc giả, tên sách..." 
              className="w-full pl-12 pr-4 py-4 bg-[#1a1d21] rounded-2xl border border-gray-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-white shadow-xl"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-[#1a1d21] rounded-[2rem] shadow-2xl border border-gray-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#23272d] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-800">
                  <th className="px-8 py-6 text-center w-24">Mã số</th>
                  <th className="px-8 py-6">Độc giả & Tác phẩm</th>
                  <th className="px-8 py-6">Lịch trình</th>
                  <th className="px-8 py-6">Trạng thái</th>
                  <th className="px-8 py-6 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/40">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                      Đang đồng bộ dữ liệu...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center text-gray-600 italic">
                      Không tìm thấy dữ liệu nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => {
                    // --- LOGIC KIỂM TRA TRẠNG THÁI ---
                    const isReturned = row.status === 'returned';
                    const today = new Date();
                    const dueDate = row.returnDate ? new Date(row.returnDate) : null;
                    // Đặt giờ về 0 để so sánh ngày chính xác
                    today.setHours(0, 0, 0, 0);
                    if (dueDate) dueDate.setHours(0, 0, 0, 0);

                    const isOverdue = !isReturned && dueDate && today > dueDate;

                    return (
                      <tr key={row.id} className="hover:bg-indigo-500/[0.02] transition-all group border-b border-gray-800/30">
                        <td className="px-8 py-6 text-center font-mono text-gray-500 text-xs">
                          #{row.id}
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <div className="font-bold text-gray-100 flex items-center gap-2">
                              <User size={14} className="text-indigo-500"/> {row.memberName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <BookIcon size={14} className="text-gray-600"/> {row.bookTitle}
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-emerald-500/80 bg-emerald-500/5 px-2 py-1 rounded-md w-fit">
                              <span>Mượn:</span>
                              <span className="text-gray-300">{new Date(row.borrowDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md w-fit ${isOverdue ? 'bg-rose-500/10 text-rose-500' : 'text-gray-500'}`}>
                              <span>Hạn trả:</span>
                              <span className={isOverdue ? 'font-bold' : 'text-gray-400'}>
                                {row.returnDate ? new Date(row.returnDate).toLocaleDateString('vi-VN') : "---"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          {isReturned ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-inner">
                              <CheckCircle size={12}/> Đã thu hồi
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-inner animate-pulse">
                              <AlertCircle size={12}/> Quá hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-inner">
                              <Clock size={12}/> Đang mượn
                            </span>
                          )}
                        </td>

                        <td className="px-8 py-6 text-right">
                          {!isReturned ? (
                            <button 
                              onClick={() => handleReturn(row.id)}
                              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto shadow-lg active:scale-95 ${
                                isOverdue 
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20' 
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                              }`}
                            >
                              <RotateCcw size={14} />
                              Thu hồi
                            </button>
                          ) : (
                            <span className="text-gray-700 text-[10px] font-bold italic mr-4 uppercase">Hoàn tất</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHistory;