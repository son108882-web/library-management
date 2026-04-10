import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Book, Users, BookOpen, AlertTriangle, 
  LayoutDashboard, Library, History, Settings, Bell, FileSpreadsheet,
  Layers // Icon cho Thể loại
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// --- IMPORT EXCELJS ---
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const trendData = [
  { name: 'T2', value: 30 }, { name: 'T3', value: 45 },
  { name: 'T4', value: 25 }, { name: 'T5', value: 60 },
  { name: 'T6', value: 75 }, { name: 'T7', value: 50 }, { name: 'CN', value: 90 },
];

const API_URL = 'http://localhost:5000/api/statistics';

const Statistics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    borrowedBooks: 0,
    newMembers: 0,
    overdueBooks: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  // --- HÀM XỬ LÝ XUẤT EXCEL ---
  const handleExportExcel = async () => {
    if (!stats.recentActivities || stats.recentActivities.length === 0) {
      alert("Không có dữ liệu hoạt động để xuất!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hoạt động mượn sách');

    worksheet.columns = [
      { header: 'NGƯỜI MƯỢN', key: 'name', width: 25 },
      { header: 'TÊN SÁCH', key: 'book', width: 35 },
      { header: 'NGÀY MƯỢN', key: 'date', width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0F172A' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    stats.recentActivities.forEach(item => {
      worksheet.addRow({
        name: item.memberName,
        book: item.bookTitle,
        date: new Date(item.borrowDate).toLocaleDateString('vi-VN')
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) row.height = 25;
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        if (cell.column === 3) cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Bao-cao-N5Book-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await axios.get(API_URL, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.data) setStats(res.data);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    getStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-slate-900 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col p-6 shadow-2xl sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/40">
            <Library size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter">N5 BOOK</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Link to="/admin/dashboard" className="block">
            <NavItem 
              icon={<LayoutDashboard size={20}/>} 
              label="Dashboard" 
              active={location.pathname === "/admin/dashboard" || location.pathname === "/admin/statistics"} 
            />
          </Link>

          <Link to="/admin/books" className="block">
            <NavItem 
              icon={<Book size={20}/>} 
              label="Quản lý sách" 
              active={location.pathname === "/admin/books"} 
            />
          </Link>

          {/* MỤC MỚI THÊM: QUẢN LÝ THỂ LOẠI */}
          <Link to="/admin/categories" className="block">
            <NavItem 
              icon={<Layers size={20}/>} 
              label="Quản lý thể loại" 
              active={location.pathname === "/admin/categories"} 
            />
          </Link>

          <Link to="/admin/users" className="block">
            <NavItem 
              icon={<Users size={20}/>} 
              label="Độc giả" 
              active={location.pathname === "/admin/users"} 
            />
          </Link>

          <Link to="/admin/history" className="block">
            <NavItem 
              icon={<History size={20}/>} 
              label="Mượn & Trả" 
              active={location.pathname === "/admin/history"} 
            />
          </Link>

          <div className="pt-8 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Cấu hình
          </div>

          <Link to="/admin/settings" className="block">
            <NavItem 
              icon={<Settings size={20}/>} 
              label="Thiết lập" 
              active={location.pathname === "/admin/settings"} 
            />
          </Link>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        <div className="flex justify-end items-center mb-12">
          <div className="flex items-center gap-6">
            <Bell className="text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" size={22} />
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-200">A</div>
          </div>
        </div>

        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-[#1E293B] tracking-tight">Thống kê tổng quan</h2>
            <p className="text-slate-500 font-medium mt-1">Dữ liệu thời gian thực từ thư viện của bạn.</p>
          </div>
          
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 text-sm"
          >
            <FileSpreadsheet size={18} />
            Xuất file Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Tổng số sách" value={stats.totalBooks} icon={<Book size={22}/>} color="blue" loading={loading} onClick={() => navigate('/admin/books')} />
          <StatCard title="Đang mượn" value={stats.borrowedBooks} icon={<BookOpen size={22}/>} color="green" loading={loading} onClick={() => navigate('/admin/history')} />
          <StatCard title="Thành viên" value={stats.newMembers} icon={<Users size={22}/>} color="purple" loading={loading} onClick={() => navigate('/admin/users')} />
          <StatCard title="Quá hạn" value={stats.overdueBooks} icon={<AlertTriangle size={22}/>} color="red" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-[#1E293B]">Xu hướng mượn sách</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">7 NGÀY QUA</div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white flex flex-col">
            <h3 className="text-xl font-bold mb-8 text-[#1E293B]">Đầu sách phổ biến</h3>
            <div className="space-y-8 flex-1">
                <TopBookRow name="Lập trình React" count={45} color="bg-blue-500 shadow-blue-100" />
                <TopBookRow name="Đắc Nhân Tâm" count={32} color="bg-emerald-500 shadow-emerald-100" />
                <TopBookRow name="Clean Code" count={18} color="bg-violet-500 shadow-violet-100" />
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tỷ lệ lưu thông</p>
              <h4 className="text-2xl font-black text-blue-600">84.5%</h4>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white mt-2">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-[#1E293B]">Hoạt động gần đây</h3>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-all">Xem tất cả</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="pb-6">Người mượn</th>
                  <th className="pb-6 text-center">Tên sách</th>
                  <th className="pb-6 text-right">Ngày mượn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(!stats.recentActivities || stats.recentActivities.length === 0) ? (
                    <tr><td colSpan="3" className="py-12 text-center text-slate-400 font-medium italic">Chưa có hoạt động mượn trả nào gần đây...</td></tr>
                ) : (
                    stats.recentActivities.map((item, index) => (
                        <tr key={index} className="group hover:bg-blue-50/50 transition-all">
                            <td className="py-5 font-bold text-slate-700">{item.memberName}</td>
                            <td className="py-5 text-slate-600 text-center">{item.bookTitle}</td>
                            <td className="py-5 text-slate-400 text-sm font-medium text-right">{new Date(item.borrowDate).toLocaleDateString('vi-VN')}</td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- CÁC COMPONENT PHỤ ---
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold scale-105' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    {icon} <span className="text-sm">{label}</span>
  </div>
);

const StatCard = ({ title, value, icon, color, loading, onClick }) => {
  const colorMap = {
    blue: "bg-blue-600 shadow-blue-200",
    green: "bg-emerald-500 shadow-emerald-200",
    purple: "bg-indigo-600 shadow-indigo-200",
    red: "bg-rose-500 shadow-rose-200",
  };
  return (
    <div onClick={onClick} className={`bg-white p-7 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50 flex items-center group hover:-translate-y-2 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}>
      <div className={`p-4 rounded-2xl mr-6 text-white shadow-lg ${colorMap[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{title}</p>
        {loading ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div> : <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>}
      </div>
    </div>
  );
};

const TopBookRow = ({ name, count, color }) => (
  <div>
    <div className="flex justify-between text-sm font-bold mb-3">
      <span className="text-slate-700">{name}</span>
      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg text-[10px]">{count} lượt</span>
    </div>
    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-[2px]">
      <div className={`${color} h-full rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${(count/50)*100}%` }}></div>
    </div>
  </div>
);

export default Statistics;