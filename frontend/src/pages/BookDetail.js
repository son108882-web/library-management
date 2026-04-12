import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

// --- IMPORT SWIPER ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [sameCategory, setSameCategory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State đánh giá
  const [averageRating, setAverageRating] = useState(0); // Sao trung bình của mọi người
  const [totalReviews, setTotalReviews] = useState(0);   // Tổng số người đánh giá
  const [userRating, setUserRating] = useState(0);       // Sao của riêng acc đang đăng nhập
  const [hoverRating, setHoverRating] = useState(0);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const bookRes = await fetch(`${BASE_URL}/api/books/${id}`);
        const bookData = await bookRes.json();

        if (bookData) {
          setBook(bookData);
          loadRatings(); // Gọi hàm tải đánh giá

          const allRes = await fetch(`${BASE_URL}/api/books`);
          let allBooks = await allRes.json();
          allBooks = allBooks.filter(b => b.quantity > 0);
          const same = allBooks.filter(b => b.category === bookData.category && b.id !== bookData.id);
          const shuffled = [...allBooks].filter(b => b.id !== bookData.id).sort(() => 0.5 - Math.random());

          setSameCategory(same.slice(0, 10)); 
          setRecommended(shuffled.slice(0, 10));
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  // --- LOGIC TÍNH TOÁN ĐÁNH GIÁ TỔNG HỢP ---
  const loadRatings = () => {
    const allRatings = JSON.parse(localStorage.getItem("global_ratings")) || {};
    const bookRatings = allRatings[id] || []; // Danh sách: [{userId: 1, star: 5}, {userId: 2, star: 4}]

    if (bookRatings.length > 0) {
      const sum = bookRatings.reduce((acc, curr) => acc + curr.star, 0);
      setAverageRating((sum / bookRatings.length).toFixed(1));
      setTotalReviews(bookRatings.length);
    } else {
      setAverageRating(0);
      setTotalReviews(0);
    }

    // Tìm xem user hiện tại đã đánh giá chưa
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      const userData = JSON.parse(userRaw);
      const userId = userData.id || userData._id || userData.email;
      const myRating = bookRatings.find(r => r.userId === userId);
      setUserRating(myRating ? myRating.star : 0);
    } else {
      setUserRating(0);
    }
  };

  const handleSetRating = (star) => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      alert("Bạn cần đăng nhập để đánh giá!");
      navigate("/login");
      return;
    }

    const userData = JSON.parse(userRaw);
    const userId = userData.id || userData._id || userData.email;

    let allRatings = JSON.parse(localStorage.getItem("global_ratings")) || {};
    let bookRatings = allRatings[id] || [];

    // Kiểm tra nếu user này đã đánh giá rồi thì cập nhật, chưa thì thêm mới
    const existingIndex = bookRatings.findIndex(r => r.userId === userId);
    if (existingIndex > -1) {
      bookRatings[existingIndex].star = star;
    } else {
      bookRatings.push({ userId, star });
    }

    allRatings[id] = bookRatings;
    localStorage.setItem("global_ratings", JSON.stringify(allRatings));
    
    loadRatings(); // Cập nhật lại giao diện ngay lập tức
  };

  const renderStars = () => {
    return (
      <div style={styles.ratingSection}>
        <div style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleSetRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                cursor: "pointer",
                fontSize: "28px",
                color: star <= (hoverRating || userRating || averageRating) ? "#facc15" : "#d1d5db",
                transition: "color 0.2s",
                marginRight: "2px"
              }}
            >
              ★
            </span>
          ))}
          <b style={{ marginLeft: "10px", fontSize: "18px" }}>{averageRating}</b>
          <span style={{ color: "#666", marginLeft: "5px" }}>({totalReviews} đánh giá)</span>
        </div>
        <p style={{ fontSize: "13px", color: "#2563eb", marginTop: "5px" }}>
          {userRating > 0 ? `Bạn đã đánh giá ${userRating} sao` : "Bấm vào sao để đánh giá cuốn sách này"}
        </p>
      </div>
    );
  };

  const handleBorrow = () => {
    if (!book || book.quantity <= 0) return;
    if (!localStorage.getItem("user")) {
      alert("Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }
    navigate(`/borrow/${book.id}`);
  };

  if (loading) return <h2 style={{ textAlign: "center", marginTop: 100 }}>Đang tải...</h2>;

  return (
    <div style={styles.container}>
      <style>{`
        .swiper-pagination-bullet-active { background: #2563eb !important; width: 20px !important; border-radius: 5px !important; }
        .swiper { padding-bottom: 50px !important; }
      `}</style>

      <div style={styles.wrapper}>
        <div style={styles.left}>
          <img
            src={book.image_url ? `${BASE_URL}${book.image_url}` : "https://via.placeholder.com/400x600"}
            style={styles.image} alt=""
          />
        </div>

        <div style={styles.right}>
          <h1 style={styles.title}>{book.title}</h1>
          
          {renderStars()}

          <div style={{ ...styles.statusBadge, background: book.quantity > 0 ? "#2ecc71" : "#e74c3c" }}>
            {book.quantity > 0 ? "Còn sách" : "Hết sách"}
          </div>

          <div style={styles.info}>
            <p><b>Tác giả:</b> {book.author}</p>
            <p><b>Thể loại:</b> {book.category}</p>
            <p><b>Số lượng:</b> {book.quantity}</p>
          </div>

          <button 
            style={{ 
              ...styles.btn, 
              ...(book.quantity <= 0 ? { background: "#94a3b8", cursor: "not-allowed", opacity: 0.7 } : {}) 
            }} 
            onClick={handleBorrow}
            disabled={book.quantity <= 0}
          >
            {book.quantity > 0 ? "Mượn ngay" : "Tạm hết sách"}
          </button>

          <div style={styles.descBox}>
            <h3>📖 Thông tin sách</h3>
            <p>{book.description || "Chưa có mô tả."}</p>
          </div>
        </div>
      </div>

      <Section title="📚 Sách cùng thể loại" books={sameCategory} />
      <Section title="🔥 Đề xuất cho bạn" books={recommended} />
    </div>
  );
}

function Section({ title, books }) {
  if (books.length === 0) return null;
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={25}
        slidesPerView={1}
        grabCursor={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        breakpoints={{ 640: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
      >
        {books.map(b => (
          <SwiperSlide key={b.id}>
            <div style={styles.card}>
              <img src={b.image_url ? `http://localhost:5000${b.image_url}` : "https://via.placeholder.com/200"} style={styles.cardImg} alt="" />
              <div style={styles.cardContent}>
                <p style={styles.cardTitle}>{b.title}</p>
                <Link to={`/books/${b.id}`}><button style={styles.smallBtn}>Xem chi tiết</button></Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const styles = {
  container: { background: "#f5f7fb", padding: "40px 20px" },
  wrapper: { display: "flex", gap: "70px", maxWidth: "1100px", margin: "0 auto" },
  left: { width: "320px" },
  image: { width: "100%", height: "500px", objectFit: "cover", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  right: { flex: 1 },
  title: { fontSize: "32px", fontWeight: "700", marginBottom: "15px" },
  ratingSection: { marginBottom: "20px" },
  starsRow: { display: "flex", alignItems: "center" },
  statusBadge: { padding: "6px 14px", borderRadius: "20px", color: "white", display: "inline-block", marginBottom: "15px", fontSize: "14px" },
  info: { lineHeight: "1.9" },
  btn: { marginTop: "20px", padding: "14px 28px", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold", background: "linear-gradient(135deg, #d70018, #9e0012)", cursor: "pointer", transition: "all 0.3s ease" },
  descBox: { marginTop: "25px", background: "white", padding: "20px", borderRadius: "12px" },
  section: { maxWidth: "1100px", margin: "60px auto" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "20px" },
  card: { background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" },
  cardImg: { width: "100%", height: "240px", objectFit: "cover" },
  cardContent: { padding: "12px" },
  cardTitle: { fontSize: "14px", fontWeight: "600", marginBottom: "10px", height: "40px", overflow: "hidden" },
  smallBtn: { width: "100%", padding: "8px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default BookDetail;