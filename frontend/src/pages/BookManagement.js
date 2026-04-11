/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Plus, Edit3, Trash2, Image as ImageIcon, 
  Type, User, Tag, Hash, Activity, RefreshCw 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api/books";

const BookManagement = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [form, setForm] = useState({ 
        title: '', author: '', category: '', quantity: 1, status: 'available', description: '' 
    });
    const [file, setFile] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAllData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(API_URL);
            setBooks(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi kết nối:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAllData(); }, []);

    const resetForm = () => {
        setForm({ title: '', author: '', category: '', quantity: 1, status: 'available', description: '' });
        setFile(null);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        if (file) formData.append('image', file);

        try {
            if (editingId) {
                await axios.put(`${API_URL}/${editingId}`, formData);
                alert("Cập nhật thành công!");
            } else {
                await axios.post(API_URL, formData);
                alert("Đã thêm sách!");
            }
            resetForm();
            loadAllData();
        } catch (error) {
            alert("Lỗi khi lưu dữ liệu!");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">Đang tải dữ liệu...</div>;

    return (
        <div className="bg-[#121212] min-h-screen text-slate-200 p-4 md:p-8">
            <div className="max-w-[1400px] mx-auto">
                
                {/* Header cố định phía trên */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-3 bg-[#1e1e1e] rounded-xl hover:bg-[#2a2a2a] transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-widest">Quản Lý Sách</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Hệ thống quản lý lưu trữ v2.0</p>
                    </div>
                </div>

                {/* Container chính: items-start là bắt buộc để sticky hoạt động */}
                <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                    
                    {/* --- CỘT TRÁI: FORM GHIM CỐ ĐỊNH --- */}
                    {/* lg:sticky và top-8 giúp nó bám trụ khi cuộn trang */}
                    <div className="w-full lg:w-[380px] lg:sticky lg:top-8 z-20">
                        <div className="bg-[#1e1e1e] p-6 rounded-[2.5rem] border border-[#2a2a2a] shadow-2xl shadow-black/50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${editingId ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                    {editingId ? "Hiệu chỉnh" : "Nhập kho"}
                                </h2>
                                <button onClick={resetForm} className="p-2 bg-[#2a2a2a] rounded-lg text-slate-400 hover:text-white transition-all">
                                    <RefreshCw size={14} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Tên tác phẩm</label>
                                    <input className="w-full bg-[#121212] border border-[#2a2a2a] p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Tác giả</label>
                                    <input className="w-full bg-[#121212] border border-[#2a2a2a] p-3 rounded-xl focus:border-blue-500 outline-none transition-all text-sm" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Thể loại</label>
                                        <input className="w-full bg-[#121212] border border-[#2a2a2a] p-3 rounded-xl text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Số lượng</label>
                                        <input type="number" className="w-full bg-[#121212] border border-[#2a2a2a] p-3 rounded-xl text-sm" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 uppercase ml-1">Ảnh bìa</label>
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[#2a2a2a] border-dashed rounded-2xl cursor-pointer bg-[#121212] hover:bg-[#181818] transition-all">
                                        <ImageIcon className="text-slate-700 mb-1" size={20} />
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{file ? file.name : "Chọn file ảnh"}</p>
                                        <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                                    </label>
                                </div>

                                <button type="submit" className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg transition-all active:scale-95 ${editingId ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white shadow-blue-900/20'}`}>
                                    {editingId ? "Lưu thay đổi" : "Xác nhận thêm"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI: DANH SÁCH (CUỘN TỰ NHIÊN THEO TRANG) --- */}
                    <div className="flex-1 w-full bg-[#1e1e1e] rounded-[2.5rem] border border-[#2a2a2a] shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2a2a2a] bg-[#222222]/30 flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Danh mục hiện tại</span>
                            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full">{books.length} Quyển</span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[#444] text-[9px] font-black uppercase tracking-[0.3em] border-b border-[#2a2a2a]">
                                        <th className="px-8 py-5">Tác phẩm</th>
                                        <th className="px-8 py-5">Phân loại</th>
                                        <th className="px-8 py-5 text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#252525]">
                                    {books.map(book => (
                                        <tr key={book.id} className="hover:bg-[#222] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-16 bg-[#121212] rounded-lg overflow-hidden border border-[#2a2a2a] flex-shrink-0 shadow-lg">
                                                        {book.image_url ? (
                                                            <img src={`http://localhost:5000${book.image_url}`} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-700">NO IMG</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <p className="font-bold text-slate-200 group-hover:text-blue-500 transition-colors">{book.title}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{book.author}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[9px] font-black px-3 py-1 bg-[#2a2a2a] rounded-md text-slate-400 uppercase tracking-tighter">
                                                    {book.category || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setForm(book); setEditingId(book.id); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 bg-[#2a2a2a] rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={14}/></button>
                                                    <button onClick={() => { if(window.confirm("Xóa nhé?")) axios.delete(`${API_URL}/${book.id}`).then(()=>loadAllData()) }} className="p-2 bg-[#2a2a2a] rounded-lg hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={14}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {books.length === 0 && (
                                <div className="py-20 text-center text-slate-600 font-bold uppercase text-xs tracking-widest opacity-20">Kho đang trống</div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookManagement;