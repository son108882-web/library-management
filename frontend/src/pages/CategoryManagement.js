import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
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
      alert("Thêm thành công!");
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi khi thêm");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ông có chắc muốn xóa thể loại này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCategories();
      } catch (err) {
        alert("Không thể xóa!");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Quản Lý Thể Loại</h2>
      
      {/* Form Thêm */}
      <form onSubmit={handleAdd} className="mb-6 bg-slate-800 p-4 rounded-lg">
        <div className="flex gap-4 mb-2">
          <input
            className="p-2 rounded bg-slate-700 text-white w-1/3"
            placeholder="Tên thể loại (vd: CNTT)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="p-2 rounded bg-slate-700 text-white w-2/3"
            placeholder="Mô tả ngắn gọn"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="bg-blue-600 px-4 py-2 rounded text-white font-bold hover:bg-blue-500">
            Thêm
          </button>
        </div>
      </form>

      {/* Bảng Hiển Thị */}
      <table className="w-full text-left text-white bg-slate-800 rounded-lg overflow-hidden">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Tên Thể Loại</th>
            <th className="p-3">Mô tả</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b border-slate-700">
              <td className="p-3">{cat.id}</td>
              <td className="p-3 font-semibold">{cat.name}</td>
              <td className="p-3 text-slate-400">{cat.description}</td>
              <td className="p-3 text-center">
                <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManagement;