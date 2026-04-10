import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* CỘT 1: THÔNG TIN THƯ VIỆN */}
        <div style={styles.column}>
          <h3 style={styles.title}>N5 LIBRARY 📚</h3>
          <p style={styles.text}>
            Hệ thống quản lý thư viện hiện đại, giúp bạn tiếp cận nguồn tri thức khổng lồ một cách dễ dàng và nhanh chóng.
          </p>
          <div style={styles.socials}>
            <span>🔵 Facebook</span> | <span>🔴 YouTube</span> | <span>🟣 Instagram</span>
          </div>
        </div>

        {/* CỘT 2: LIÊN KẾT NHANH */}
        <div style={styles.column}>
          <h4 style={styles.subTitle}>Liên Kết</h4>
          <ul style={styles.list}>
            <li style={styles.listItem}>🏠 Trang chủ</li>
            <li style={styles.listItem}>📖 Kho sách</li>
            <li style={styles.listItem}>📝 Đăng ký mượn</li>
            <li style={styles.listItem}>📞 Hỗ trợ</li>
          </ul>
        </div>

        {/* CỘT 3: LIÊN HỆ */}
        <div style={styles.column}>
          <h4 style={styles.subTitle}>Liên Hệ</h4>
          <p style={styles.text}>📍 Địa chỉ: 123 Thư Viện, Đà Nẵng</p>
          <p style={styles.text}>📞 Hotline: 1900 1234</p>
          <p style={styles.text}>✉️ Email: hỗ trợ@n5library.edu.vn</p>
          <p style={styles.text}>⏰ Giờ mở cửa: 08:00 - 21:00</p>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG */}
      <div style={styles.bottomBar}>
        <p style={styles.copyright}>
          © 2026 Q-Library System - Team Dev React. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#2c3e50', // Màu xanh đen đậm cho sang trọng
    color: '#ecf0f1',
    padding: '40px 0 0 0',
    marginTop: '50px',
    borderTop: '5px solid #d70018',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: '0 20px 40px 20px',
  },
  column: {
    flex: '1',
    minWidth: '250px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '20px',
    color: '#61dafb', // Màu xanh React
  },
  subTitle: {
    fontSize: '1.1rem',
    marginBottom: '15px',
    borderBottom: '2px solid #61dafb',
    display: 'inline-block',
    paddingBottom: '5px',
  },
  text: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    opacity: '0.8',
    margin: '10px 0',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    fontSize: '0.9rem',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: '0.3s',
    // Hover sẽ làm sáng lên
  },
  socials: {
    marginTop: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  bottomBar: {
    backgroundColor: '#1a252f',
    padding: '15px 0',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  copyright: {
    margin: 0,
    fontSize: '0.85rem',
    opacity: '0.6',
  },
};

export default Footer;