/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Type, 
  User, 
  Tag, 
  Hash, 
  Activity 
} from 'lucide-react'; // Thêm icon cho xịn
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api/books";

const BookManagement = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [topBooks, setTopBooks] = useState([]);
    const [slowBooks, setSlowBooks] = useState([]);
    
    const [form, setForm] = useState({ 
        title: '', author: '', category: '', quantity: 1, status: 'available', description: '' 
    });
    const [file, setFile] = useState(null);
    
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [resBooks, resTop, resSlow] = await Promise.all([
                axios.get(API_URL),
                axios.get(`${API_URL}/top`),
                axios.get(`${API_URL}/slow`)
            ]);
            setBooks(Array.isArray(resBooks.data) ? resBooks.data : []);
            setTopBooks(Array.isArray(resTop.data) ? resTop.data : []);
            setSlowBooks(Array.isArray(resSlow.data) ? resSlow.data : []);
        } catch (error) {
            console.error("❌ Lỗi load dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAllData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('author', form.author);
        formData.append('category', form.category);
        formData.append('quantity', form.quantity);
        formData.append('status', form.status);
        formData.append('description', form.description);
        if (file) formData.append('image', file);

        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Cập nhật thành công!");
            } else {
                await axios.post(API_URL, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Thêm sách mới thành công!");
            }
            setForm({ title: '', author: '', category: '', quantity: 1, status: 'available', description: '' });
            setFile(null);
            setEditingId(null);
            loadAllData();
        } catch (error) {
            alert("Lỗi khi lưu: " + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa không?")) {
            try { await axios.delete(`${API_URL}/${id}`); loadAllData(); } 
            catch (error) { alert("Lỗi khi xóa: " + error.message); }
        }
    };

    const handleEdit = (book) => {
        setForm({
            title: book.title,
            author: book.author,
            category: book.category || '',
            quantity: book.quantity,
            status: book.status,
            description: book.description || ''
        });
        setEditingId(book.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans text-slate-900">
            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm border border-slate-200 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý Kho Sách</h1>
                        <p className="text-slate-500 font-medium text-sm">Cập nhật và điều chỉnh danh mục sách trong thư viện.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- PHẦN FORM NHẬP LIỆU --- */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-xl ${editingId ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingId ? "Sửa thông tin" : "Thêm sách mới"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Tên sách</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Tác giả</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Thể loại</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Số lượng</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input type="number" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Trạng thái</label>
                                <div className="relative">
                                    <Activity className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <select className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                        <option value="available">Sẵn sàng</option>
                                        <option value="borrowed">Đang mượn</option>
                                        <option value="damaged">Sự cố/Hỏng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Ảnh bìa</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-2">
                                            <ImageIcon className="text-slate-400 mb-1" size={20} />
                                            <p className="text-[10px] text-slate-500 font-bold">{file ? file.name : "Nhấn để tải ảnh"}</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Mô tả</label>
                                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] text-sm" placeholder="Nhập nội dung tóm tắt..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                {editingId && (
                                    <button type="button" onClick={() => {setEditingId(null); setForm({title:'',author:'',category:'',quantity:1,status:'available',description:''})}} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Hủy</button>
                                )}
                                <button type="submit" className={`flex-[2] py-3 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 ${editingId ? 'bg-amber-500 shadow-amber-200 hover:bg-amber-600' : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'}`}>
                                    {editingId ? "Lưu thay đổi" : "Xác nhận thêm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* --- BẢNG DANH SÁCH SÁCH --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="text-xl font-bold text-slate-800">Danh mục trong kho</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                        <th className="p-6">Sách</th>
                                        <th className="p-6">Phân loại</th>
                                        <th className="p-6">Trạng thái</th>
                                        <th className="p-6 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {books.length > 0 ? books.map(book => (
                                        <tr key={book.id} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="p-6">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden shadow-sm border border-slate-100 relative group-hover:scale-105 transition-transform duration-300">
                                                        {book.image_url ? (
                                                            <img src={`http://localhost:5000${book.image_url}`} alt="cover" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 italic text-[10px]">No Pic</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center max-w-[200px]">
                                                        <span className="font-bold text-slate-700 block truncate">{book.title}</span>
                                                        <span className="text-xs text-slate-400 font-medium">TG: {book.author}</span>
                                                        <span className="text-[10px] text-slate-300 italic truncate mt-1">{book.description || 'Chưa có mô tả'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider">{book.category || 'N/A'}</span>
                                            </td>
                                            <td className="p-6">
                                                {book.status === 'available' ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Sẵn sàng
                                                    </span>
                                                ) : book.status === 'borrowed' ? (
                                                    <span className="text-amber-500 font-bold text-xs uppercase">Đang mượn</span>
                                                ) : (
                                                    <span className="text-rose-500 font-bold text-xs uppercase">Sự cố</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(book)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(book.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="p-16 text-center text-slate-400 italic font-medium">
                                                Kho sách hiện đang trống...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookManagement;