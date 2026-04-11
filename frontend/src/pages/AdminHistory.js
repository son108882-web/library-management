import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  History, Search, CheckCircle, Clock, 
  RotateCcw, User, Book as BookIcon, ArrowLeft, AlertCircle, Hash
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

  const filteredData = history
    .filter(item => 
      (item.memberName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.bookTitle?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & NAVIGATION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin/dashboard')} 
              className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm border border-slate-200 transition-all active:scale-95 group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Mượn & Trả</h1>
              <p className="text-slate-500 mt-1 font-medium flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Theo dõi lưu thông sách trong thư viện
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm tên độc giả, tên sách..." 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-[1.5rem] border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-slate-700 shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- TABLE CONTAINER --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-8 py-6 text-center w-24">ID</th>
                  <th className="px-8 py-6">Độc giả & Tác phẩm</th>
                  <th className="px-8 py-6">Thời hạn lưu thông</th>
                  <th className="px-8 py-6">Trạng thái</th>
                  <th className="px-8 py-6 text-right">Hành động</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <History size={48} className="text-slate-200" />
                        <p className="text-slate-400 italic font-medium">Không tìm thấy bản ghi nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => {
                    const isReturned = row.status === 'returned';
                    const today = new Date();
                    const dueDate = row.returnDate ? new Date(row.returnDate) : null;
                    today.setHours(0, 0, 0, 0);
                    if (dueDate) dueDate.setHours(0, 0, 0, 0);

                    const isOverdue = !isReturned && dueDate && today > dueDate;

                    return (
                      <tr key={row.id} className="hover:bg-indigo-50/30 transition-all group">
                        <td className="px-8 py-6 text-center">
                          <span className="font-mono text-slate-400 text-xs flex items-center justify-center gap-1">
                             <Hash size={12}/> {row.id}
                          </span>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-slate-700 flex items-center gap-2 uppercase text-sm">
                              <User size={14} className="text-indigo-500"/> {row.memberName}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                              <BookIcon size={14} className="text-slate-300"/> {row.bookTitle}
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg w-fit border border-emerald-100">
                              <span>Mượn:</span>
                              <span>{new Date(row.borrowDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-2 py-1 rounded-lg w-fit border ${isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              <span>Hạn trả:</span>
                              <span>{row.returnDate ? new Date(row.returnDate).toLocaleDateString('vi-VN') : "---"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          {isReturned ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border bg-emerald-50 text-emerald-600 border-emerald-100">
                              <CheckCircle size={12}/> Đã thu hồi
                            </span>
                          ) : isOverdue ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border bg-rose-50 text-rose-600 border-rose-100 animate-pulse">
                              <AlertCircle size={12}/> Quá hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border bg-amber-50 text-amber-600 border-amber-100">
                              <Clock size={12}/> Đang mượn
                            </span>
                          )}
                        </td>

                        <td className="px-8 py-6 text-right">
                          {!isReturned ? (
                            <button 
                              onClick={() => handleReturn(row.id)}
                              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ml-auto shadow-md active:scale-95 ${
                                isOverdue 
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                              }`}
                            >
                              <RotateCcw size={14} />
                              Thu hồi
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px] font-black italic mr-4 uppercase tracking-widest">Hoàn tất</span>
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