import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');

  let user = null;

  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch {}
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // 🔥 THÊM (quan trọng)
    localStorage.removeItem("role");  // 🔥 QUAN TRỌNG NHẤT

    window.location.href = '/'; 
  };

  return (
    <header style={styles.header}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <span>🚚 Miễn phí mượn sách cho sinh viên | 📚 Hỗ trợ đổi sách | ✅ Hệ thống thư viện N5</span>
      </div>
      
      {/* Main Nav */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.logo}>
          N5 <span style={{color: '#ffeb3b'}}>BOOK</span>
        </Link>
        
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input 
            type="text" 
            placeholder="Tìm tên sách, tác giả..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>
            <i className="fas fa-search"></i> Tìm kiếm
          </button>
        </form>

        <div style={styles.authGroup}>
          {user ? (
            <div style={styles.userSection}>
              <Link to="/profile" style={{ textDecoration: "none" }}>
                <span style={styles.userLabel}>
                  Xin chào, <strong>{user?.name}</strong>
                </span>
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={styles.loginLink}>Đăng nhập</Link>
              <Link to="/register" style={styles.registerBtn}>Đăng ký</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const styles = {
  header: { width: '100%', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 15px rgba(0,0,0,0.1)' },
  topBar: { background: '#1a2a6c', color: 'white', fontSize: '12px', padding: '8px', textAlign: 'center', fontWeight: '300' },
  nav: { background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)', padding: '15px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: 'white', textDecoration: 'none', fontSize: '28px', fontWeight: '800', letterSpacing: '1px' },
  searchForm: { display: 'flex', width: '40%', background: 'white', borderRadius: '50px', padding: '4px', overflow: 'hidden' },
  searchInput: { flex: 1, border: 'none', padding: '10px 20px', outline: 'none', fontSize: '14px' },
  searchBtn: { background: '#f39c12', color: 'white', border: 'none', padding: '0 20px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  authGroup: { display: 'flex', gap: '15px', alignItems: 'center' },
  loginLink: { color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  registerBtn: { background: 'white', color: '#1a2a6c', padding: '8px 20px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' },
  logoutBtn: { background: '#ff4b2b', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  userLabel: { color: 'white', fontSize: '14px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '10px' } // 🔥 thêm nhẹ cho đẹp
};

export default Header;