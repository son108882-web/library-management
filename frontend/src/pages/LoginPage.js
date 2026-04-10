import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        alert("Server không trả JSON");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Đăng nhập thất bại");
        return;
      }

      if (!data.user || !data.user.id) {
        alert("Dữ liệu user không hợp lệ");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Đăng nhập thành công!");
      navigate("/");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Không kết nối được server!");
    }
  };

  return (
    <div style={{ padding: '100px', textAlign: 'center', minHeight: '60vh', backgroundColor: '#f4f7f6' }}>
      <h2 style={{ color: '#282c34' }}>Đăng Nhập</h2>

      <form 
        onSubmit={handleLogin}
        style={{
          display: 'inline-block',
          textAlign: 'left',
          background: '#fff',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label><br/>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Mật khẩu:</label><br/>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.btn}>Đăng nhập</button>
      </form>
    </div>
  );
};

const styles = {
  input: {
    width: '300px',
    padding: '12px',
    marginTop: '5px',
    borderRadius: '5px',
    border: '1px solid #ddd'
  },
  btn: {
    width: '100%',
    padding: '12px',
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default LoginPage;