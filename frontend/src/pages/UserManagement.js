import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { Search, Edit, Trash2, Lock, Unlock, X, Plus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/users'; // Đảm bảo URL này khớp với route backend của ông
const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true", 
  "Content-Type": "application/json"
};

const UserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: '', role: 'user', contact: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_BASE_URL, { headers: NGROK_HEADERS });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi lấy danh sách:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', role: 'user', contact: '' });
  };

  const handleEditClick = (user) => {
    setEditingUser(user); 
    // FIX: Gán đúng role từ user vào formData để khi mở modal không bị nhảy về 'user'
    setFormData({
      name: user.full_name || user.username || '', 
      role: user.role || 'user', 
      contact: user.email || '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, { headers: NGROK_HEADERS });
        fetchUsers();
      } catch (error) { alert("Lỗi khi xóa! Có thể người dùng này đang có dữ liệu mượn sách liên quan."); }
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'locked' : 'active';
    try {
      await axios.put(`${API_BASE_URL}/${user.id}`, { 
        ...user,
        status: newStatus 
      }, { headers: NGROK_HEADERS });
      fetchUsers();
    } catch (error) { alert("Lỗi cập nhật trạng thái"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        // Đảm bảo các key này (full_name, email, role) khớp với Schema Database của ông
        full_name: formData.name,  
        email: formData.contact,
        role: formData.role,
        status: editingUser ? editingUser.status : "active"
      };

      if (editingUser) {
        // Gửi yêu cầu cập nhật
        await axios.put(`${API_BASE_URL}/${editingUser.id}`, payload, { headers: NGROK_HEADERS });
        alert("Cập nhật thành công!");
      } else {
        // Gửi yêu cầu thêm mới (Nếu backend của ông hỗ trợ POST /api/users)
        await axios.post(API_BASE_URL, payload, { headers: NGROK_HEADERS });
        alert("Thêm thành viên thành công!");
      }
      
      fetchUsers(); // Load lại danh sách mới
      handleCloseModal(); // Đóng modal
    } catch (error) {
      console.error("Lỗi chi tiết:", error.response?.data || error.message);
      alert("Lỗi lưu dữ liệu! Kiểm tra Console để xem chi tiết lỗi từ Backend.");
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Sinh viên';
      case 'user': return 'Khách hàng';
      case 'giangvien': return 'Giảng viên';
      default: return role || 'Chưa xác định';
    }
  };

  

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-screen text-slate-900 font-sans">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border border-white">
        <div>
          <h2 className="text-4xl font-black text-[#1E293B] tracking-tight">Quản lý người dùng</h2>
          <p className="text-slate-500 font-medium mt-1">Hệ thống quản trị thư viện N5 BOOK</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-72 group">
            <input 
              type="text" 
              placeholder="Tìm kiếm thành viên..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-7 py-3.5 rounded-2xl flex items-center gap-2 font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
            <Plus size={20} /> Thêm mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-white">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <th className="px-8 py-6">Thành viên</th>
              <th className="px-8 py-6 text-center">Vai trò</th>
              <th className="px-8 py-6">Trạng thái</th>
              <th className="px-8 py-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users
              .filter(u => (u.full_name || u.username || "").toLowerCase().includes(searchTerm.toLowerCase()))
              .map((user) => (
              <tr key={user.id} className="group hover:bg-blue-50/30 transition-all">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-100">
                      {(user.full_name || user.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-base">{user.full_name || user.username}</div>
                      <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  {/* FIX: Thêm màu tím cho Giảng viên */}
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                      : user.role === 'giangvien'
                      ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                    user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {user.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => handleEditClick(user)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
                    <button onClick={() => handleToggleStatus(user)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
                      {user.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white">
            <div className="bg-[#1E293B] p-6 flex justify-between text-white">
              <div>
                <h3 className="text-xl font-bold">{editingUser ? 'Cập nhật thành viên' : 'Thêm thành viên mới'}</h3>
                <p className="text-slate-400 text-xs mt-1">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
              <button onClick={handleCloseModal} className="h-10 w-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                <input 
                  placeholder="VD: Nguyễn Văn A" 
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vai trò hệ thống</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all appearance-none cursor-pointer" 
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">Khách hàng</option>
                    <option value="admin">Sinh viên</option>
                    <option value="giangvien">Giảng viên</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Plus size={16} className="rotate-45" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ Email</label>
                <input 
                  placeholder="example@gmail.com" 
                  className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 transition-all" 
                  value={formData.contact} 
                  onChange={e => setFormData({...formData, contact: e.target.value})} 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;