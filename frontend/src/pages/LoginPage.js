import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      let data;
      try { data = await res.json(); } catch { alert("Server không trả JSON"); return; }

      if (!res.ok) { alert(data.error || "Đăng nhập thất bại"); return; }
      if (!data.user || !data.user.id) { alert("Dữ liệu user không hợp lệ"); return; }

      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Đăng nhập thành công!");
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Không kết nối được server!");
    }
  };

// ... các phần import và logic giữ nguyên ...

  return (
    <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '70vh', backgroundColor: '#f4f7f6' }}>
      <div style={styles.card}>
        {/* Header đã căn giữa và in đậm */}
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={styles.headerTitle}>Đăng Nhập</h2>
          <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '5px 0 0 0' }}>
            Chào mừng bạn quay trở lại thư viện
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* ... các ô input giữ nguyên ... */}
          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="example@gmail.com"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Mật khẩu</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.inputPassword}
                placeholder="••••••••"
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.iconWrapper}
              >
                {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
              </div>
            </div>
          </div>

          <button type="submit" style={styles.btn}>Đăng nhập</button>
        </form>

        <div style={styles.footerText}>
          Chưa có tài khoản?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={styles.link}
          >
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'inline-block',
    textAlign: 'left', // Nội dung bên trong form vẫn căn trái cho dễ nhập liệu
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '380px'
  },
  headerTitle: { 
    color: '#2c3e50', 
    fontSize: '28px', 
    fontWeight: '800', 
    margin: 0,
    textAlign: 'center' // Đảm bảo chữ nằm chính giữa
  },
  // ... các styles còn lại giữ nguyên như cũ ...
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
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  },
  inputPassword: {
    width: '100%',
    padding: '12px',
    paddingRight: '45px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  iconWrapper: {
    position: 'absolute',
    right: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  btn: {
    width: '100%',
    padding: '14px',
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '25px',
    fontSize: '14px',
    color: '#666'
  },
  link: {
    color: '#3498db',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    marginLeft: '5px'
  }
};

export default LoginPage;