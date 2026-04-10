import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  History, Search, CheckCircle, Clock, 
  RotateCcw, User, Book as BookIcon,
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/borrows';

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  // 🔥 CHỈ SỬA DUY NHẤT Ở ĐÂY
  const filteredData = history
    .filter(item => 
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.id - b.id); // 🔥 sort từ nhỏ → lớn

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <History size={28} />
            </div>
            Quản lý Mượn & Trả
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Theo dõi và cập nhật trạng thái lưu thông sách
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm độc giả hoặc tên sách..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] border-b border-slate-100">
                <th className="px-8 py-6 text-center w-20">ID</th>
                <th className="px-8 py-6">Thông tin mượn</th>
                <th className="px-8 py-6">Thời gian</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse font-bold">
                    Đang tải dữ liệu từ thư viện...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 italic">
                    Không tìm thấy bản ghi nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5 text-center font-mono text-slate-400 text-sm">
                      #{row.id}
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 flex items-center gap-2">
                          <User size={14} className="text-blue-500"/> {row.memberName}
                        </span>
                        <span className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <BookIcon size={14} className="text-slate-400"/> {row.bookTitle}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                          <span className="font-medium">
                            Mượn: {new Date(row.borrowDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 mt-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                          <span>
                            Hạn: {row.returnDate 
                              ? new Date(row.returnDate).toLocaleDateString('vi-VN') 
                              : "Chưa định ngày"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center w-fit gap-2 shadow-sm ${
                        row.status === 'returned' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {row.status === 'returned' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                        {row.status === 'returned' ? 'Đã trả sách' : 'Đang mượn'}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-right">
                      {row.status !== 'returned' && (
                        <button 
                          onClick={() => handleReturn(row.id)}
                          className="bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto shadow-sm"
                        >
                          <RotateCcw size={14} />
                          Thu hồi sách
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHistory;