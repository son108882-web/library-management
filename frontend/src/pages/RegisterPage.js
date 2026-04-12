import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; 

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert("🎉 Đăng ký tài khoản thư viện thành công!");
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
    <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '80vh', backgroundColor: '#f4f7f6' }}>
      <div style={styles.card}>
        {/* Header: Căn giữa, Bỏ icon, In đậm cực hạn */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={styles.headerTitle}>Đăng Ký</h2>
          <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '5px 0 0 0' }}>
            Tham gia thư viện để mượn hàng ngàn cuốn sách
          </p>
        </div>
        
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>Tên người dùng</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Ví dụ: nguyenvana"
              required 
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
              required 
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.passwordWrapper}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Ít nhất 6 ký tự"
                  required 
                  style={styles.inputPassword}
                />
                <div onClick={() => setShowPassword(!showPassword)} style={styles.iconWrapper}>
                    {showPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
                </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Xác nhận mật khẩu</label>
            <div style={styles.passwordWrapper}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Nhập lại mật khẩu"
                  required 
                  style={styles.inputPassword}
                />
                <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.iconWrapper}>
                    {showConfirmPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
                </div>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          
          <button type="submit" style={styles.btn}>Tạo tài khoản</button>
        </form>

        <div style={styles.footerText}>
          Đã có tài khoản?{' '}
          <span 
            onClick={() => navigate('/login')} 
            style={styles.link}
          >
            Đăng nhập ngay
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    display: 'inline-block', 
    textAlign: 'left', 
    background: 'white', 
    padding: '40px', 
    borderRadius: '16px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px'
  },
  headerTitle: { 
    color: '#2c3e50', 
    fontSize: '28px', 
    fontWeight: '800', // In đậm cực hạn giống Login
    margin: 0,
    textAlign: 'center'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '8px',
    display: 'block'
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontSize: '14px',
    outline: 'none'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputPassword: {
    width: '100%', 
    padding: '12px', 
    paddingRight: '45px',
    borderRadius: '8px', 
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    fontSize: '14px',
    outline: 'none'
  },
  iconWrapper: {
    position: 'absolute',
    right: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  errorBox: { 
    background: '#fdeaea',
    color: '#e74c3c', 
    padding: '10px',
    borderRadius: '5px',
    fontSize: '13px', 
    fontWeight: '500', 
    marginBottom: '15px',
    border: '1px solid #fadbd8'
  },
  btn: { 
    width: '100%', 
    padding: '14px', 
    background: '#2c3e50', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '16px'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
    color: '#666'
  },
  link: {
    color: '#3498db', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    textDecoration: 'none',
    marginLeft: '5px'
  }
};

export default RegisterPage;