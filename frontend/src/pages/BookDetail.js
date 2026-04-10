import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [sameCategory, setSameCategory] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const bookRes = await fetch(`${BASE_URL}/api/books/${id}`);
        if (!bookRes.ok) throw new Error("Không thể tải chi tiết sách");
        const bookData = await bookRes.json();

        if (bookData) {
          setBook(bookData);

          const allRes = await fetch(`${BASE_URL}/api/books`);
          let allBooks = await allRes.json();

          // ✅ ẨN SÁCH HẾT
          allBooks = allBooks.filter(b => b.quantity > 0);

          const same = allBooks.filter(
            b => b.category === bookData.category && b.id !== bookData.id
          );

          const shuffled = [...allBooks]
            .filter(b => b.id !== bookData.id)
            .sort(() => 0.5 - Math.random());

          setSameCategory(same.slice(0, 4));
          setRecommended(shuffled.slice(0, 4));
        }
      } catch (err) {
        console.error("Lỗi Fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // ✅ SỬA LOGIC: Chuyển hướng sang trang BorrowPage thay vì gọi API mượn tại đây
  const handleBorrow = () => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      alert("Bạn cần đăng nhập để mượn sách!");
      navigate("/login");
      return;
    }

    // Kiểm tra số lượng sách trước khi cho phép qua trang điền phiếu
    if (!book || book.quantity <= 0) {
      alert("Sách hiện tại đã hết, vui lòng chọn cuốn khác.");
      return;
    }

    // Chuyển hướng sang BorrowPage với ID của sách
    navigate(`/borrow/${book.id}`);
  };

  if (loading) return <h2 style={{ textAlign: "center", marginTop: 100 }}>Đang tải...</h2>;
  if (!book) return <h2 style={{ textAlign: "center", marginTop: 100 }}>Không tìm thấy sách</h2>;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.left}>
          <img
            src={book.image_url ? `${BASE_URL}${book.image_url}` : "https://via.placeholder.com/400x600"}
            alt={book.title}
            style={styles.image}
          />
        </div>

        <div style={styles.right}>
          <h1 style={styles.title}>{book.title}</h1>
          <div style={styles.rating}>★★★★★</div>

          {/* ✅ FIX STATUS */}
          <div style={{
            ...styles.statusBadge,
            background: book.quantity > 0 ? "#2ecc71" : "#e74c3c"
          }}>
            {book.quantity > 0 ? "Còn sách" : "Hết sách"}
          </div>

          <div style={styles.info}>
            <p><b>Tác giả:</b> {book.author}</p>
            <p><b>Thể loại:</b> {book.category}</p>
            <p><b>Số lượng:</b> {book.quantity}</p>
          </div>

          {/* ✅ FIX BUTTON: Gọi handleBorrow mới */}
          <button
            style={{
              ...styles.btn,
              opacity: book.quantity <= 0 ? 0.6 : 1,
              cursor: book.quantity <= 0 ? "not-allowed" : "pointer",
              background: book.quantity <= 0
                ? "#95a5a6"
                : "linear-gradient(135deg, #d70018, #9e0012)"
            }}
            disabled={book.quantity <= 0}
            onClick={handleBorrow}
          >
            {book.quantity > 0 ? "Mượn ngay" : "Hết sách"}
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
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.grid}>
        {books.map(b => (
          <div key={b.id} style={styles.card}>
            <img
              src={b.image_url ? `http://localhost:5000${b.image_url}` : "https://via.placeholder.com/200"}
              style={styles.cardImg} alt=""
            />
            <div style={styles.cardContent}>
              <p style={styles.cardTitle}>{b.title}</p>
              <Link to={`/books/${b.id}`}>
                <button style={styles.smallBtn}>Xem chi tiết</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#f5f7fb", padding: "40px 20px" },
  wrapper: { display: "flex", gap: "70px", maxWidth: "1100px", margin: "0 auto" },
  left: { width: "320px" },
  image: { width: "100%", height: "500px", objectFit: "cover", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  right: { flex: 1 },
  title: { fontSize: "32px", fontWeight: "700" },
  rating: { color: "#facc15", margin: "10px 0" },
  statusBadge: { padding: "6px 14px", borderRadius: "20px", color: "white", display: "inline-block", marginBottom: "15px" },
  info: { lineHeight: "1.9" },
  btn: { marginTop: "20px", padding: "14px 28px", color: "white", border: "none", borderRadius: "12px", fontWeight: "bold" },
  descBox: { marginTop: "25px", background: "white", padding: "20px", borderRadius: "12px" },
  section: { maxWidth: "1100px", margin: "60px auto" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", marginBottom: "20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" },
  card: { background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" },
  cardImg: { width: "100%", height: "240px", objectFit: "cover" },
  cardContent: { padding: "12px" },
  cardTitle: { fontSize: "14px", fontWeight: "600", marginBottom: "10px" },
  smallBtn: { width: "100%", padding: "8px", background: "#2563eb", color: "white", border: "none", borderRadius: "8px" }
};

export default BookDetail;