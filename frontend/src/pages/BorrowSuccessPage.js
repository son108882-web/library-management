import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const BorrowSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Nhận dữ liệu từ state. Lưu ý tên biến displayDate phải khớp với trang gửi
    const { bookTitle} = location.state || {};

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconWrapper}>
                    <FaCheckCircle style={styles.icon} />
                </div>
                
                <h2 style={styles.title}>MƯỢN SÁCH THÀNH CÔNG!</h2>
                
                <p style={styles.message}>
                    Bạn đã mượn cuốn: <strong>{bookTitle || "Kỳ Án Ánh Trăng"}</strong>
                </p>

                <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                        <span style={styles.emoji}>📍</span>
                        <span><strong>Lưu ý:</strong> Vui lòng nhận sách tại quầy trong 24h.</span>
                    </div>
                </div>

                <button onClick={() => navigate('/')} style={styles.button}>
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', justifyContent: 'center', padding: '60px 20px', background: '#f8f9fa', minHeight: '80vh' },
    card: { background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center', maxWidth: '450px', width: '100%' },
    iconWrapper: { marginBottom: '20px' },
    icon: { fontSize: '70px', color: '#2ecc71' },
    title: { fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '10px' },
    message: { color: '#666', marginBottom: '30px', fontSize: '15px' },
    infoBox: { background: '#fff5f5', padding: '20px', borderRadius: '12px', textAlign: 'left', marginBottom: '30px', borderLeft: '5px solid #d70018' },
    infoRow: { display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '14px', color: '#444' },
    emoji: { fontSize: '16px' },
    button: { background: '#d70018', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default BorrowSuccess;