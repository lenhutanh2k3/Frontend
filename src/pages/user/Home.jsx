import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllBooks } from '../../features/book/bookSlice';
import { getAllCategories } from '../../features/category/categorySlice';

import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { FaStar, FaShoppingCart, FaHeart, FaArrowRight, FaBook, FaNewspaper, FaTrophy, FaTag, FaFire } from 'react-icons/fa';

const Home = () => {
  const dispatch = useDispatch();
  const { books, loading: booksLoading } = useSelector(state => state.book);
  const { categories, loading: categoriesLoading } = useSelector(state => state.category);

  console.log(books);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [discountedBooks, setDiscountedBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);

  const { isAuthenticated } = useSelector(state => state.auth);
  console.log("books",books);
  useEffect(() => {
    dispatch(getAllBooks({ limit: 50 })); // Tăng limit để có nhiều sách hơn
    dispatch(getAllCategories());

  }, [dispatch]);

  useEffect(() => {
    if (books.length > 0) {

      // Sách mới - sắp xếp theo createdAt
      setNewBooks(
        [...books]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8)
      );

      // Sách bán chạy - dựa trên salesCount
      setBestsellers(
        [...books]
          .filter(book => book.salesCount > 0)
          .sort((a, b) => b.salesCount - a.salesCount)
          .slice(0,8)
      );

      // Sách khuyến mãi - tạm thời bỏ qua
      setDiscountedBooks([]);

      // Sách đề xuất - dựa trên danh mục phổ biến (nếu user đã đăng nhập)
      if (isAuthenticated) {
        const popularCategories = categories.slice(0, 3); // Lấy 3 danh mục phổ biến
        const recommended = [...books]
          .filter(book => 
            popularCategories.some(cat => 
              book.category?._id === cat._id || book.category === cat._id
            )
          )
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);
        setRecommendedBooks(recommended);
      }
    }
  }, [books, categories, isAuthenticated]);

  // Hàm lấy giá hiển thị
  const getDisplayPrice = (book) => {
    return (
      <span className="font-bold text-lg text-green-600">
        {book.price?.toLocaleString('vi-VN')}₫
      </span>
    );
  };

  const BookCard = ({ book, variant = 'default' }) => {
    const cardVariants = {
      default: 'hover:shadow-2xl hover:scale-105',
      featured: 'ring-2 ring-yellow-400 hover:shadow-2xl hover:scale-105',
      new: 'ring-2 ring-green-400 hover:shadow-2xl hover:scale-105',
      bestseller: 'ring-2 ring-red-400 hover:shadow-2xl hover:scale-105',
      discounted: 'ring-2 ring-orange-400 hover:shadow-2xl hover:scale-105',
    };



    return (
      <Card className={`group cursor-pointer transition-all duration-300 transform ${cardVariants[variant]}`}>
        <Link to={`/bookstore/${book._id}`} className="block">
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={`${import.meta.env.VITE_BOOK_SERVICE}/${book.images?.[0]?.path || 'Uploads/default-image.jpg'}`}
              alt={book.title}
              className="w-full h-45 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300 bg-gray-100"
            />
            
            {/* Badge loại sách */}
            {variant === 'featured' && (
              <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <FaStar /> Nổi bật
              </div>
            )}
            {variant === 'new' && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <FaNewspaper /> Mới
              </div>
            )}
            {variant === 'bestseller' && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <FaTrophy /> Bán chạy
              </div>
            )}

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100">
                <FaHeart className="text-red-500 text-base" />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <p className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {book.title}
            </p>
            <p className="text-sm text-gray-600 line-clamp-1">
              {book.author?.name || 'Tác giả chưa xác định'}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400 text-base" />
                <span className="text-sm text-gray-600">
                  {(book.averageRating !== undefined ? book.averageRating : book.rating)?.toFixed(1) || '0.0'}
                </span>
                <span className="text-xs text-gray-400">
                  ({book.totalReviews !== undefined ? book.totalReviews : book.reviewCount || 0})
                </span>
              </div>
            </div>
            {/* Hiển thị số lượng đã mua cho sách bán chạy */}
            {variant === 'bestseller' && book.salesCount > 0 && (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-1">
                  <FaShoppingCart className="text-green-500 text-xs" />
                  <span className="text-xs text-green-600 font-medium">
                    {book.salesCount} lượt mua
                  </span>
                </div>
              </div>
            )}
            <div className="mt-1">
              {getDisplayPrice(book)}
            </div>
          </div>
        </Link>
      </Card>
    );
  };

  const CategoryCard = ({ category, index }) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-red-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-pink-600',
      'from-teal-500 to-green-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-purple-600',
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-green-600',
      'from-violet-500 to-purple-600'
    ];
    
    const colorClass = colors[index % colors.length];
    
    return (
      <Link to={`/bookstore?category=${category._id}`}>
        <Card className="text-center flex flex-col items-center justify-center min-w-[220px] max-w-[220px] h-[220px] hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className={`w-16 h-16 mb-4 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
            <FaBook className="text-white text-2xl" />
          </div>
          <h5 className="font-semibold text-gray-900 mb-2 text-base group-hover:text-blue-600 transition-colors break-words w-full px-2">{category.name}</h5>
        </Card>
      </Link>
    );
  };

  if (booksLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 text-white py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-xl">
              Khám phá thế giới sách
              <span className="block text-yellow-300 mt-2">tại BookStore</span>
            </h1>
            <p className="text-base md:text-lg lg:text-xl mb-8 text-blue-100 drop-shadow-md">
              Hàng nghìn cuốn sách hay, đa dạng thể loại, giao hàng nhanh chóng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/bookstore" size="lg" variant="primary" className="px-8 py-4 bg-blue-500 text-white border-2 border-blue-500 rounded-lg flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-transform">
                Mua sắm ngay <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="py-6 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/bookstore?discounted=true"
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-all duration-300 group"
            >
              <FaFire className="text-2xl text-red-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-700">Khuyến mãi</span>
              <span className="text-xs text-gray-500">Giảm giá hot</span>
            </Link>
            
            <Link 
              to="/bookstore?sort=newest"
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 group"
            >
              <FaNewspaper className="text-2xl text-green-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-700">Sách mới</span>
              <span className="text-xs text-gray-500">Vừa cập nhật</span>
            </Link>
            
            <Link 
              to="/bookstore?sort=bestseller"
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
            >
              <FaTrophy className="text-2xl text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-700">Bán chạy</span>
              <span className="text-xs text-gray-500">Nhiều người mua</span>
            </Link>
            
            <Link 
              to="/bookstore?sort=rating"
              className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-all duration-300 group"
            >
              <FaStar className="text-2xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-700">Đánh giá cao</span>
              <span className="text-xs text-gray-500">4+ sao</span>
            </Link>
          </div>
        </div>
      </section>



      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-2 md:px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-2 md:mb-4 tracking-tight">
              Danh mục sách
            </h2>
            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá các thể loại sách đa dạng, từ văn học, kinh tế đến khoa học công nghệ
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.slice(0, 12).map((category, index) => (
              <div key={category._id} className="flex-shrink-0 min-w-[220px] max-w-[220px] h-[220px] flex items-center justify-center">
                <CategoryCard category={category} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Books */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-2 md:gap-0">
            <div className="flex items-center gap-3">
              <FaNewspaper className="text-3xl text-green-500" />
              <h2 className="text-xl md:text-3xl font-extrabold text-gray-900">Sách mới</h2>
            </div>
            <Link to="/bookstore?sort=newest" className="text-green-600 hover:text-green-800 font-semibold flex items-center transition-colors">
              Xem tất cả <FaArrowRight className="ml-2" />
            </Link>
          </div>
          {newBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {newBooks.map(book => (
                <BookCard key={book._id} book={book} variant="new" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có sách mới</p>
              <Link 
                to="/bookstore" 
                className="inline-block mt-4 text-green-600 hover:text-green-800 font-semibold"
              >
                Xem tất cả sách
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 gap-2 md:gap-0">
            <div className="flex items-center gap-3">
              <FaTrophy className="text-3xl text-red-500" />
              <h2 className="text-xl md:text-3xl font-extrabold text-gray-900">Top 8 Sách bán chạy</h2>
            </div>
            <Link to="/bookstore?sort=bestseller" className="text-red-600 hover:text-red-800 font-semibold flex items-center transition-colors">
              Xem tất cả <FaArrowRight className="ml-2" />
            </Link>
          </div>
          {bestsellers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {bestsellers.map(book => (
                <BookCard key={book._id} book={book} variant="bestseller" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có sách bán chạy</p>
              <Link 
                to="/bookstore" 
                className="inline-block mt-4 text-red-600 hover:text-red-800 font-semibold"
              >
                Xem tất cả sách
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;