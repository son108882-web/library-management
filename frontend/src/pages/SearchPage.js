import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/books";
const BORROW_API = "http://localhost:5000/api/borrows";

// 🔥 STYLE
const styles = {
  container: "min-h-screen bg-[#f3f4f6] px-6 pt-4 pb-10 font-sans",
  layout: "flex gap-6 items-start",

  sidebar:
    "w-[190px] shrink-0 bg-white p-3 rounded-xl shadow-sm sticky top-[100px] h-fit",

  card:
    "bg-white rounded-2xl shadow-sm hover:shadow-lg transition p-4 flex flex-col h-full",

  imageWrap: "aspect-[3/4] w-full overflow-hidden rounded-xl relative",
  image: "w-full h-full object-cover",

  // 🔥 SỬA 1: TITLE ĐẬM HƠN
  title:
    "font-bold text-[15px] leading-snug line-clamp-2 min-h-[42px]",

  author: "text-sm text-gray-500 mt-1",

  // 🔥 SỬA 2: BUTTON ĐẬM HƠN
  btnPrimary:
    "flex-1 py-2 rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg",

  btnDisabled:
    "flex-1 py-2 rounded-lg text-sm font-bold text-white bg-gray-400 cursor-not-allowed",

  btnSecondary:
    "w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm"
};

export default function SearchPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    keyword: "",
    category: "Tất cả",
    status: "Tất cả"
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keywordFromURL = searchParams.get("search") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      const res = await axios.get(API_URL);
      setBooks(res.data);
      setLoading(false);
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      keyword: keywordFromURL.toLowerCase()
    }));
  }, [keywordFromURL]);

  const categories = ["Tất cả", "Kỹ năng", "Kinh dị", "Hài hước", "Văn học"];

  const filteredBooks = books.filter(book => {
    const matchKeyword =
      book.title.toLowerCase().includes(filters.keyword) ||
      book.author.toLowerCase().includes(filters.keyword);

    const matchCategory =
      filters.category === "Tất cả" ||
      (book.category && book.category.includes(filters.category));

    const matchStatus =
      filters.status === "Tất cả" ||
      (filters.status === "available" && book.quantity > 0) ||
      (filters.status === "borrowed" && book.quantity === 0);

    return matchKeyword && matchCategory && matchStatus;
  });

  const handleBorrow = async (bookId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      await axios.post(BORROW_API, {
        user_id: user.id,
        book_id: bookId
      });

      alert("Mượn thành công!");

      setBooks(prev =>
        prev.map(b =>
          b.id === bookId
            ? { ...b, quantity: b.quantity - 1 }
            : b
        )
      );
    } catch (err) {
      alert(err.response?.data?.error || "Mượn thất bại");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className={styles.container}>

      <h2 className="text-2xl font-bold mb-5">🔍 Tìm kiếm sách</h2>

      <div className={styles.layout}>

        {/* SIDEBAR */}
        <div className={styles.sidebar}>

          <h3 className="font-semibold text-sm mb-2">Bộ lọc</h3>

          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Danh mục</p>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat })}
                  className={`cursor-pointer px-2 py-1.5 rounded-md text-xs ${
                    filters.category === cat
                      ? "bg-green-100 text-green-600 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Trạng thái</p>
            <ul className="space-y-1">
              {[
                { key: "Tất cả", label: "Tất cả" },
                { key: "available", label: "Còn sách" },
                { key: "borrowed", label: "Đã mượn" }
              ].map(st => (
                <li
                  key={st.key}
                  onClick={() => setFilters({ ...filters, status: st.key })}
                  className={`cursor-pointer px-2 py-1.5 rounded-md text-xs ${
                    filters.status === st.key
                      ? "bg-green-100 text-green-600 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {st.label}
                </li>
              ))}
            </ul>
          </div>

          <button
            className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg text-xs"
            onClick={() =>
              setFilters({
                keyword: keywordFromURL,
                category: "Tất cả",
                status: "Tất cả"
              })
            }
          >
            Xóa lọc
          </button>
        </div>

        {/* LIST */}
        <div className="flex-1">

          <p className="mb-4 text-sm text-gray-600">
            Tìm thấy <b>{filteredBooks.length}</b> sách
          </p>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-6">

            {filteredBooks.map(book => {
              const isOut = book.quantity <= 0;

              return (
                <div key={book.id} className={styles.card}>

                  <div className={styles.imageWrap}>
                    <img
                      src={
                        book.image_url
                          ? `http://localhost:5000${book.image_url}`
                          : "https://via.placeholder.com/150"
                      }
                      className={styles.image}
                      alt=""
                    />

                    <span
                      className={`absolute top-2 right-2 text-white text-xs px-3 py-1 rounded-full ${
                        isOut ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {isOut ? "Hết sách" : "Sẵn có"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col flex-1">
                    <h3 className={styles.title}>{book.title}</h3>
                    <p className={styles.author}>Tác giả: {book.author}</p>

                    <div className="flex gap-2 mt-auto pt-4">
                      <Link to={`/books/${book.id}`} className="flex-1">
                        <button className={styles.btnSecondary}>
                          Chi tiết
                        </button>
                      </Link>

                      <button
                        onClick={() => handleBorrow(book.id)}
                        disabled={isOut}
                        className={isOut ? styles.btnDisabled : styles.btnPrimary}
                      >
                        {isOut ? "Hết sách" : "Mượn ngay"}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}