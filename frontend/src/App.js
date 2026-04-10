import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserManagement from './pages/UserManagement';
import BookDetail from './pages/BookDetail';
import BookManagement from './pages/BookManagement'; 
import AdminDashBoard from './pages/AdminDashBoard'; 
import SearchPage from "./pages/SearchPage";
import BorrowPage from './pages/BorrowPage';
import BorrowSuccessPage from './pages/BorrowSuccessPage';
import CategoryManagement from "./pages/CategoryManagement";
// --- DÒNG THÊM MỚI 1: IMPORT TRANG LỊCH SỬ ---
import AdminHistory from './pages/AdminHistory'; 

function NavigationWrapper() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/admin/books" element={<BookManagement />} />
        <Route path="/admin/dashboard" element={<AdminDashBoard />} />
        <Route path="/admin/history" element={<AdminHistory />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/borrow/:bookId" element={<BorrowPage />} />
        <Route path="/borrow-success" element={<BorrowSuccessPage />} />
        <Route path="/admin/categories" element={<CategoryManagement />} />
      </Routes>
      
      {!isAdminPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <NavigationWrapper />
    </Router>
  );
}
export default App;