/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Đổi thành link ngrok nếu ông đang chạy qua ngrok nhé
const API_URL = "http://localhost:5000/api/books";

const BookManagement = () => {
    const [books, setBooks] = useState([]);
    const [topBooks, setTopBooks] = useState([]);
    const [slowBooks, setSlowBooks] = useState([]);
    
    // --- CẬP NHẬT 1: Thêm description vào form state ---
    const [form, setForm] = useState({ 
        title: '', author: '', category: '', quantity: 1, status: 'available', description: '' 
    });
    const [file, setFile] = useState(null); // State mới để lưu file ảnh
    
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

    // --- CẬP NHẬT 2: Chuyển sang dùng FormData để gửi ảnh ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('author', form.author);
        formData.append('category', form.category);
        formData.append('quantity', form.quantity);
        formData.append('status', form.status);
        formData.append('description', form.description); // Gửi mô tả
        if (file) formData.append('image', file); // Gửi file ảnh nếu có

        try {
            if (editingId) {
                // Lưu ý: PUT với file ảnh đôi khi phức tạp, 
                // tạm thời ta dùng post cho thêm mới để test ảnh trước
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
            
            // Reset toàn bộ
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
            description: book.description || '' // Đổ mô tả vào form khi sửa
        });
        setEditingId(book.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">📚 Quản Lý Kho Sách</h1>

            {/* --- PHẦN 2: FORM NHẬP LIỆU (ĐÃ THÊM Ô MÔ TẢ & CHỌN ẢNH) --- */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-100">
                <h2 className="text-xl font-bold mb-4 text-gray-700">{editingId ? "📝 Chỉnh sửa thông tin" : "➕ Thêm sách mới"}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="border p-2 rounded" placeholder="Tên sách" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    <input className="border p-2 rounded" placeholder="Tác giả" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required />
                    <input className="border p-2 rounded" placeholder="Thể loại" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                    <input className="border p-2 rounded" type="number" placeholder="Số lượng" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                    
                    <select className="border p-2 rounded bg-white" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        <option value="available">Còn sách</option>
                        <option value="borrowed">Đang mượn</option>
                        <option value="damaged">Hỏng/Sự cố</option>
                    </select>

                    {/* --- Ô CHỌN ẢNH --- */}
                    <div className="flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">Ảnh bìa sách:</label>
                        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-sm" />
                    </div>

                    {/* --- Ô NHẬP MÔ TẢ (Full width) --- */}
                    <textarea 
                        className="border p-2 rounded md:col-span-2 h-24" 
                        placeholder="Mô tả nội dung sách..." 
                        value={form.description} 
                        onChange={e => setForm({...form, description: e.target.value})}
                    />

                    <div className="md:col-span-2 flex justify-end gap-2">
                        {editingId && (
                            <button type="button" onClick={() => {setEditingId(null); setForm({title:'',author:'',category:'',quantity:1,status:'available',description:''})}} className="px-4 py-2 bg-gray-400 text-white rounded">Hủy</button>
                        )}
                        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">
                            {editingId ? "Lưu thay đổi" : "Xác nhận thêm"}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- PHẦN 3: BẢNG DANH SÁCH (THÊM CỘT ẢNH NHỎ ĐỂ XEM) --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <th className="p-4 border-b">Ảnh</th>
                                <th className="p-4 border-b">Thông tin sách</th>
                                <th className="p-4 border-b">Thể loại</th>
                                <th className="p-4 border-b">Trạng thái</th>
                                <th className="p-4 border-b text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 text-sm">
                            {books.length > 0 ? books.map(book => (
                                <tr key={book.id} className="hover:bg-blue-50 border-b">
                                    <td className="p-4">
                                        {book.image_url ? (
                                            <img src={`http://localhost:5000${book.image_url}`} alt="cover" className="w-12 h-16 object-cover rounded shadow-sm" />
                                        ) : (
                                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{book.title}</div>
                                        <div className="text-xs text-gray-400 italic truncate w-40">{book.description || 'Không có mô tả'}</div>
                                    </td>
                                    <td className="p-4">{book.category}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${book.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {book.status === 'available' ? 'Sẵn sàng' : 'Đang mượn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(book)} className="text-blue-600">Sửa</button>
                                        <button onClick={() => handleDelete(book.id)} className="text-red-500">Xóa</button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" className="p-10 text-center">Trống</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BookManagement;