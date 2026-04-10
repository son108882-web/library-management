import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // 2. Khai báo hook navigate

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      // GỬI DỮ LIỆU VÀO DATABASE QUA API
      const response = await fetch('http://localhost:5000/api/users/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng ký tài khoản thư viện thành công!");
        navigate('/login'); 
      } else {
        setError(data.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      setError("Lỗi kết nối Server! Hãy kiểm tra xem Backend đã chạy chưa.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '70vh', backgroundColor: '#f4f7f6' }}>
      <div style={{ 
        display: 'inline-block', 
        textAlign: 'left', 
        background: 'white', 
        padding: '40px', 
        borderRadius: '10px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Đăng Ký Tài Khoản</h2>
        
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Username:</label><br/>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Nhập tên đăng nhập"
              required 
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Email:</label><br/>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="nhapemail@dongda.edu.vn"
              required 
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Mật khẩu:</label><br/>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Ít nhất 6 ký tự"
              required 
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold' }}>Xác nhận mật khẩu:</label><br/>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Nhập lại mật khẩu trên"
              required 
              style={styles.input}
            />
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px' }}>{error}</p>}
          
          <button type="submit" style={styles.btn}>Đăng ký ngay</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          Đã có tài khoản? <a href="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  input: { 
    width: '100%', 
    padding: '12px', 
    marginTop: '8px', 
    borderRadius: '5px', 
    border: '1px solid #ddd',
    boxSizing: 'border-box' 
  },
  btn: { 
    width: '100%', 
    padding: '12px', 
    background: '#2c3e50', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '10px'
  }
};

export default RegisterPage;