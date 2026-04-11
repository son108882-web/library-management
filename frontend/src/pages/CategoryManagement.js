import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Plus, FolderPlus, Trash2, Tag, FileText, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/categories",
        { name, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      fetchCategories();
      alert("Thêm thể loại thành công!");
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi thêm");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ông có chắc muốn xóa thể loại này không? Nó có thể ảnh hưởng đến các sách thuộc thể loại này đó!")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (err) {
        alert("Không thể xóa thể loại này!");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm border border-slate-200 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản Lý Thể Loại</h1>
            <p className="text-slate-500 font-medium text-sm">Tổ chức danh mục sách theo chủ đề.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- FORM THÊM MỚI --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <FolderPlus size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Thêm Thể Loại</h2>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Tên Thể Loại</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="VD: Công nghệ thông tin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1 tracking-wider">Mô tả chi tiết</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] text-sm"
                    placeholder="Nhập mô tả về thể loại này..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Xác nhận thêm
              </button>
            </form>
          </div>
        </div>

        {/* --- DANH SÁCH THỂ LOẠI --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Danh mục hiện có</h3>
              <span className="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                {categories.length} Thể loại
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                    <th className="p-6 w-20">ID</th>
                    <th className="p-6">Tên Thể Loại</th>
                    <th className="p-6">Mô tả</th>
                    <th className="p-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.length > 0 ? categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-indigo-50/30 transition-all group">
                      <td className="p-6">
                        <span className="font-mono text-slate-400 text-xs flex items-center gap-1">
                           <Hash size={12}/> {cat.id}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </td>
                      <td className="p-6">
                        <p className="text-sm text-slate-400 line-clamp-2 max-w-[300px]">
                          {cat.description || "Chưa có mô tả chi tiết cho thể loại này."}
                        </p>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          title="Xóa thể loại"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Tag size={40} className="text-slate-200" />
                          <p className="text-slate-400 italic font-medium">Hiện chưa có thể loại nào được tạo.</p>
                        </div>
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

export default CategoryManagement;