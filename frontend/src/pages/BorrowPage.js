import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// Thư viện hỗ trợ hiển thị ngày tháng chuẩn Việt Nam
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BorrowPage = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Giữ nguyên các ô nhập liệu
    const [borrowerInfo, setBorrowerInfo] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    const displayToday = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    // Quản lý hạn trả sách
    const [returnDate, setReturnDate] = useState(null);

    useEffect(() => {
        const fetchBookDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/books/${bookId}`);
                setBook(res.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin sách:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookDetail();
    }, [bookId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBorrowerInfo({ ...borrowerInfo, [name]: value });
    };

    const handleConfirmBorrow = async () => {
        // Kiểm tra validation
        if (!borrowerInfo.fullName || !borrowerInfo.phone || !borrowerInfo.address || !returnDate) {
            alert("Vui lòng điền đầy đủ thông tin cá nhân và chọn hạn trả sách!");
            return;
        }

        try {
            // Lấy user_id từ localStorage (mặc định id: 1 nếu chưa đăng nhập)
            const user = JSON.parse(localStorage.getItem('user')) || { id: 1 };

            // CHUẨN BỊ CHUỖI NGÀY ĐÃ FORMAT ĐỂ GỬI ĐI
            const formattedDateForSuccessPage = format(returnDate, 'dd/MM/yyyy');

            const response = await axios.post('http://localhost:5000/api/borrows', {
                user_id: user.id, 
                book_id: bookId,
                borrower_name: borrowerInfo.fullName,
                borrower_phone: borrowerInfo.phone,
                borrower_address: borrowerInfo.address,
                borrow_date: format(new Date(), 'yyyy-MM-dd'),
                return_date: format(returnDate, 'yyyy-MM-dd') 
            });

            if (response.status === 200 || response.status === 201) {
                // FIX LỖI "Invalid Date": Truyền chuỗi string đã format thay vì Object Date
                navigate('/borrow-success', { 
                    state: { 
                        bookTitle: book.title, 
                        displayReturnDate: formattedDateForSuccessPage 
                    } 
                });
            }
        } catch (error) {
            // Xử lý lỗi kết nối server
            console.error("Lỗi kết nối API:", error);
            alert("Lỗi: Không thể kết nối đến server. Vui lòng kiểm tra lại Backend!");
        }
    };

    // Khắc phục lỗi trắng trang khi đang load dữ liệu
    if (loading) return <div style={styles.loading}>Đang tải phiếu mượn...</div>;
    if (!book) return <div style={styles.loading}>Không tìm thấy thông tin sách.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.header}>XÁC NHẬN PHIẾU MƯỢN SÁCH</h2>
                
                <div style={styles.content}>
                    <div style={styles.imageSection}>
                        <img 
                            src={book.image_url ? `http://localhost:5000${book.image_url}` : "https://via.placeholder.com/200x300"} 
                            alt={book.title} 
                            style={styles.bookImg}
                        />
                    </div>

                    <div style={styles.infoSection}>
                        <h4 style={styles.sectionTitle}>📘 Thông tin sách</h4>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Tên sách:</label>
                            <span style={styles.value}>{book.title}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Tác giả:</label>
                            <span style={{...styles.value, color: '#0056b3', fontWeight: 'bold'}}>{book.author || "Quỷ Cổ Nữ"}</span>
                        </div>

                        <h4 style={styles.sectionTitle}>👤 Thông tin người mượn (Vui lòng nhập)</h4>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Họ và tên:</label>
                            <input 
                                type="text" name="fullName" placeholder="Nhập họ và tên..."
                                value={borrowerInfo.fullName} onChange={handleInputChange}
                                style={styles.textInput}
                            />
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Số điện thoại:</label>
                            <input 
                                type="text" name="phone" placeholder="Nhập số điện thoại..."
                                value={borrowerInfo.phone} onChange={handleInputChange}
                                style={styles.textInput}
                            />
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Địa chỉ:</label>
                            <input 
                                type="text" name="address" placeholder="Ký túc xá / Địa chỉ nhà..."
                                value={borrowerInfo.address} onChange={handleInputChange}
                                style={styles.textInput}
                            />
                        </div>

                        <h4 style={styles.sectionTitle}>📅 Thời gian mượn</h4>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Ngày mượn:</label>
                            <span style={{...styles.value, color: '#2ecc71', fontWeight: 'bold'}}>{displayToday}</span>
                        </div>
                        <div style={styles.infoGroup}>
                            <label style={styles.label}>Hạn trả sách:</label>
                            <DatePicker
                                selected={returnDate}
                                onChange={(date) => setReturnDate(date)}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                locale={vi}
                                placeholderText="Chọn ngày trả"
                                customInput={<input style={styles.dateInput} />}
                            />
                        </div>
                        
                        <div style={styles.noteBox}>
                            <p style={styles.noteTitle}>⚠️ Lưu ý:</p>
                            <p style={{fontSize: '12px', color: '#666', margin: 0}}>
                                Bạn chịu trách nhiệm bảo quản sách cẩn thận. Vui lòng hoàn trả đúng hạn để không bị khóa tài khoản.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={styles.buttonGroup}>
                    <button onClick={() => navigate(-1)} style={styles.cancelBtn}>Hủy bỏ</button>
                    <button onClick={handleConfirmBorrow} style={styles.confirmBtn}>Xác nhận mượn</button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { backgroundColor: '#f4f6f8', minHeight: '90vh', padding: '40px 20px', display: 'flex', justifyContent: 'center' },
    card: { backgroundColor: 'white', maxWidth: '850px', width: '100%', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '30px' },
    header: { textAlign: 'center', color: '#d70018', marginBottom: '30px', fontWeight: 'bold', textTransform: 'uppercase' },
    content: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
    imageSection: { flex: '1', minWidth: '250px', textAlign: 'center' },
    bookImg: { width: '100%', maxWidth: '220px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
    infoSection: { flex: '2', minWidth: '300px' },
    sectionTitle: { fontSize: '14px', color: '#d70018', borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '15px', marginBottom: '15px', fontWeight: 'bold' },
    infoGroup: { marginBottom: '12px', display: 'flex', alignItems: 'center' },
    label: { width: '130px', color: '#7f8c8d', fontSize: '14px' },
    value: { flex: 1, fontSize: '15px', fontWeight: '500' },
    textInput: { flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: '#f0f4f8' },
    dateInput: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', width: '100%', backgroundColor: '#f0f4f8', cursor: 'pointer' },
    noteBox: { backgroundColor: '#fff5f5', padding: '15px', borderRadius: '10px', border: '1px dashed #feb2b2', marginTop: '20px' },
    noteTitle: { margin: '0 0 5px 0', color: '#e53e3e', fontWeight: 'bold', fontSize: '13px' },
    buttonGroup: { display: 'flex', gap: '20px', marginTop: '40px', justifyContent: 'flex-end' },
    cancelBtn: { padding: '10px 30px', borderRadius: '8px', border: '1px solid #ddd', background: '#f8f9fa', cursor: 'pointer', fontWeight: 'bold' },
    confirmBtn: { padding: '10px 40px', borderRadius: '8px', border: 'none', background: '#d70018', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
    loading: { textAlign: 'center', marginTop: '100px', fontSize: '18px' }
};

export default BorrowPage;