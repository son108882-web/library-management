import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Cấu hình API
const API_URL = "http://localhost:5000/api/books";
const CATEGORY_API_URL = "http://localhost:5000/api/categories";

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState(['Tất cả']);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('search')?.toLowerCase() || '';

  // 1. LẤY DỮ LIỆU TỪ DATABASE
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksRes, catRes] = await Promise.all([
          axios.get(API_URL),
          axios.get(CATEGORY_API_URL)
        ]);

        setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
        
        if (Array.isArray(catRes.data)) {
          const dynamicCategories = catRes.data.map(c => c.name);
          setCategories(['Tất cả', ...dynamicCategories]);
        }
      } catch (error) {
        console.error("❌ Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. LOGIC LỌC SÁCH
  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'Tất cả' || 
                           (book.category && book.category.includes(selectedCategory));
    const matchesSearch = book.title.toLowerCase().includes(keyword) || 
                          book.author.toLowerCase().includes(keyword);
    return matchesCategory && matchesSearch;
  });

  // 3. XỬ LÝ MƯỢN SÁCH (Đã fix lỗi nhận diện Token)
  const handleBorrowClick = (book, e) => {
    e?.preventDefault();
    e?.stopPropagation();

    // Kiểm tra trực tiếp localStorage khi click để lấy data mới nhất
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (!token) {
      alert("⚠️ Bạn cần đăng nhập để thực hiện chức năng này!");
      navigate("/login");
      return;
    }

    if (book.quantity < 1) {
      alert("Sách này hiện đã hết trong kho!");
      return;
    }

    navigate(`/borrow/${book.id}`);
  };

  if (loading) return <div style={{textAlign: 'center', padding: '100px'}}>Đang tải dữ liệu thư viện...</div>;

  return (
    <div style={styles.container}>
      {/* BANNER */}
      <div style={styles.banner}>
        <div style={styles.bannerOverlay}>
          <h1 style={styles.bannerTitle}>HỆ THỐNG QUẢN LÝ THƯ VIỆN</h1>
          <p style={styles.bannerSub}>Nguồn tri thức vô tận từ Database SQL</p>
          <div style={styles.bannerStats}>
            <div style={styles.statItem}><strong>{books.length}+</strong> <br/> Đầu sách</div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}><strong>Sẵn sàng</strong> <br/> Phục vụ</div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* THANH CHỌN THỂ LOẠI ĐỘNG */}
        <div style={styles.categoryBar}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...styles.categoryBtn,
                background: selectedCategory === cat ? 'linear-gradient(135deg, #d70018 0%, #9e0012 100%)' : 'white',
                color: selectedCategory === cat ? 'white' : '#333',
                border: selectedCategory === cat ? 'none' : '1px solid #eee'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TIÊU ĐỀ KẾT QUẢ */}
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>
            {keyword ? `🔍 Tìm kiếm: "${keyword}"` : `📚 Danh mục: ${selectedCategory}`}
          </h3>
          <span style={styles.bookCount}>Tìm thấy <strong>{filteredBooks.length}</strong> cuốn</span>
        </div>
        
        {/* LƯỚI SÁCH */}
        <div style={styles.bookGrid}>
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => {
              const isOutOfStock = book.quantity < 1;

              return (
                <div key={book.id} style={styles.bookCard}>
                  {/* Trạng thái */}
                  <div style={{
                    ...styles.statusBadge,
                    background: !isOutOfStock ? '#2ecc71' : '#e74c3c'
                  }}>
                    {!isOutOfStock ? 'Sẵn có' : 'Hết sách'}
                  </div>

                  <div style={styles.bookCoverWrapper}>
                    <img 
                      src={book.image_url ? `http://localhost:5000${book.image_url}` : "https://via.placeholder.com/150x200?text=No+Image"} 
                      alt={book.title} 
                      style={styles.bookCoverImg} 
                    />
                  </div>
                  
                  <div style={styles.bookDetailArea}>
                    <h4 style={styles.bookName}>{book.title}</h4>
                    <p style={styles.bookAuthor}>TG: {book.author}</p>
                    
                    <div style={styles.actionGroup}>
                      <Link 
                        to={`/books/${book.id}`} 
                        state={{ book }}
                        style={{ textDecoration: "none", flex: 1 }}
                      >
                        <button style={styles.detailsBtn}>Chi tiết</button>
                      </Link>

                      <button 
                        style={{
                          ...styles.borrowBtn,
                          opacity: isOutOfStock ? 0.5 : 1,
                          cursor: isOutOfStock ? "not-allowed" : "pointer"
                        }}
                        disabled={isOutOfStock}
                        onClick={(e) => handleBorrowClick(book, e)}
                      >
                        Mượn ngay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.noResult}>
              <p>Không tìm thấy sách phù hợp trong kho.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES GIỮ NGUYÊN GIAO DIỆN CỦA BẠN ---
const styles = {
  container: { fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f0f2f5', minHeight: '100vh' },
  banner: { height: '300px', backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1600&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bannerOverlay: { textAlign: 'center', color: 'white', background: 'rgba(0, 0, 0, 0.6)', padding: '30px', borderRadius: '15px', width: '80%' },
  bannerTitle: { fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: 'bold' },
  bannerSub: { fontSize: '1.1rem', marginBottom: '20px' },
  bannerStats: { display: 'flex', justifyContent: 'center', gap: '30px' },
  statItem: { fontSize: '0.9rem' },
  statDivider: { width: '1px', height: '30px', background: 'rgba(255,255,255,0.3)' },
  content: { maxWidth: '1200px', margin: '-40px auto 50px auto', padding: '0 20px' },
  categoryBar: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', background: 'white', padding: '15px', borderRadius: '50px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap' },
  categoryBtn: { padding: '8px 20px', borderRadius: '20px', border: '1px solid #eee', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  sectionTitle: { margin: 0, fontSize: '1.4rem' },
  bookCount: { color: '#7f8c8d' },
  bookGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  bookCard: { background: 'white', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  statusBadge: { position: 'absolute', top: '10px', right: '10px', color: 'white', padding: '3px 10px', borderRadius: '15px', fontSize: '10px', fontWeight: 'bold', zIndex: 2 },
  bookCoverWrapper: { height: '220px', background: '#fdfdfd', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' },
  bookCoverImg: { height: '100%', maxWidth: '100%', objectFit: 'contain' },
  bookDetailArea: { padding: '12px' },
  bookName: { fontSize: '0.95rem', fontWeight: '700', height: '40px', overflow: 'hidden' },
  bookAuthor: { fontSize: '0.8rem', color: '#7f8c8d', margin: '5px 0' },
  actionGroup: { display: 'flex', gap: '5px', marginTop: '10px' },
  detailsBtn: { width: '100%', padding: '8px', background: '#f0f2f5', border: 'none', borderRadius: '5px', fontSize: '0.8rem', cursor: 'pointer' },
  borrowBtn: { flex: 1, padding: '8px', background: '#d70018', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' },
  noResult: { gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#999' }
};

export default HomePage;