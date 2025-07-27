import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookById } from '../../features/book/bookSlice';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaArrowLeft, FaChevronLeft, FaChevronRight, FaPlus, FaMinus } from 'react-icons/fa';
import { addToCart } from '../../features/cart/cartSlice';

import ReviewSection from '../../components/common/ReviewSection';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/Loading';

const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedBook: book, loading, error } = useSelector((state) => state.book);
    const { loading: cartLoading } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [showFullDescription, setShowFullDescription] = useState(false);

   

    useEffect(() => {
        dispatch(getBookById(id));
    }, [dispatch, id]);

    // Hàm refetchBook để truyền xuống ReviewSection
    const refetchBook = () => {
        dispatch(getBookById(id));
    };

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (book) {
            const currentStock = book.stockCount || 0;
            if (currentStock === 0) {
                setQuantity(0);
            } else if (quantity > currentStock || quantity < 1) {
                setQuantity(1);
            }
        }
    }, [book, quantity]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        const maxStock = book?.stockCount || 0;
        if (isNaN(value) || value < 1) {
            setQuantity(1);
            return;
        }
        if (value > maxStock) {
            setQuantity(maxStock);
            if (maxStock > 0) toast.warn(`Số lượng không được vượt quá tồn kho: ${maxStock}`);
        } else {
            setQuantity(value);
        }
    };

    const increaseQuantity = () => {
        const maxStock = book?.stockCount || 0;
        if (quantity < maxStock) {
            setQuantity(prev => prev + 1);
        } else {
            if (maxStock > 0) toast.warn(`Đã đạt số lượng tồn kho tối đa: ${maxStock}`);
            else toast.error("Sách hiện đang hết hàng.");
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (!book?.availability || book?.stockCount === 0 || quantity === 0) {
            toast.error('Sách hiện đang hết hàng hoặc số lượng không hợp lệ!');
            return;
        }
        if (quantity < 1) {
            toast.error('Số lượng phải lớn hơn 0.');
            return;
        }
        if (quantity > book.stockCount) {
            toast.error(`Số lượng bạn chọn (${quantity}) vượt quá số lượng tồn kho (${book.stockCount}).`);
            return;
        }
        if (!isAuthenticated) {
            toast.info('Bạn vui lòng đăng nhập hoặc đăng ký tài khoản để thêm vào giỏ hàng.');
            return;
        }
        dispatch(addToCart({ bookId: book._id, quantity }))
            .unwrap()
            .catch((err) => {
                console.error("Failed to add to cart:", err);
            });
    };

    

    const handlePrevImage = () => {
        setSelectedImage((prev) => (prev === 0 ? book.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImage((prev) => (prev === book.images.length - 1 ? 0 : prev + 1));
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="text-center max-w-sm mx-auto p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sách</h2>
                    <p className="text-red-500 text-base mb-4">{error}</p>
                    <Button onClick={() => navigate('/bookstore')} variant="primary" className="px-6 py-3">
                        <FaArrowLeft className="inline-block mr-2" /> Quay lại cửa hàng
                    </Button>
                </Card>
            </div>
        );
    }

    // Tính giá cuối cùng với khuyến mãi
    const price = book.finalPrice !== undefined ? book.finalPrice : book.price;
    const discount = book.discount !== undefined ? book.discount : 0;
    
    const originalPrice = book.price !== undefined ? book.price : 0;
    const releaseDate = book.releaseDate ? new Date(book.releaseDate).toLocaleDateString('vi-VN') : null;
    const isPreOrder = book.isPreOrder && releaseDate && new Date(book.releaseDate) > new Date();

    return (
        <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
            <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
                <nav className="text-sm text-gray-600 mb-6 sm:mb-8">
                    <ol className="list-none p-0 inline-flex space-x-2">
                        <li className="flex items-center">
                            <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">Trang chủ</Link>
                            <span className="mx-2">/</span>
                        </li>
                        {book.category && (
                            <li className="flex items-center">
                                <Link to={`/bookstore?category=${book.category._id}`} className="text-blue-600 hover:text-blue-800 font-medium">{book.category.name}</Link>
                                <span className="mx-2">/</span>
                            </li>
                        )}
                        <li className="text-gray-800 font-semibold line-clamp-1">{book.title}</li>
                    </ol>
                </nav>
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                    {/* Ảnh sách */}
                    <div className="lg:w-2/5 w-full">
                        <Card className="p-4 sm:p-6 flex flex-col items-center bg-gradient-to-br from-white to-gray-50 shadow-xl">
                            <div className="relative w-full h-64 sm:h-80 flex items-center justify-center mb-4 sm:mb-6 rounded-xl overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_BOOK_SERVICE}/${book.images?.[selectedImage]?.path || 'Uploads/default-image.jpg'}`}
                                    alt={book.title}
                                    className="w-full h-full object-contain rounded-xl bg-gray-100 transition-transform duration-300 hover:scale-105"
                                />
                                {book.images && book.images.length > 1 && (
                                    <>
                                        <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300">
                                            <FaChevronLeft className="text-gray-700 text-base" />
                                        </button>
                                        <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300">
                                            <FaChevronRight className="text-gray-700 text-base" />
                                        </button>
                                    </>
                                )}
                            </div>
                            {book.images && book.images.length > 1 && (
                                <div className="flex gap-2 mt-2 overflow-x-auto custom-scrollbar">
                                    {book.images.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={`${import.meta.env.VITE_BOOK_SERVICE}/${img.path}`}
                                            alt={book.title}
                                            className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 ${selectedImage === idx ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-blue-400'}`}
                                            onClick={() => setSelectedImage(idx)}
                                        />
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                    {/* Thông tin sách */}
                    <div className="lg:w-3/5 w-full flex flex-col gap-4 sm:gap-6">
                        <Card className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 sm:mb-6">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 md:mb-0 line-clamp-2">{book.title}</h1>
                                
                            </div>
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-yellow-400 text-base sm:text-lg" />
                                    <span className="font-semibold text-gray-800 text-base sm:text-lg">{book.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="text-xs sm:text-sm text-gray-500">({book.reviewCount || 0} đánh giá)</span>
                                </div>
                                {book.salesCount > 0 && (
                                    <span className="text-xs sm:text-sm text-green-600 font-semibold">Đã bán: {book.salesCount}</span>
                                )}
                                {isPreOrder && (
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">Đặt trước đến {releaseDate}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <span className="text-xl sm:text-2xl font-bold text-green-600">{(price || 0).toLocaleString('vi-VN')}₫</span>
                                {book.stockCount === 0 && (
                                    <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">Hết hàng</span>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm text-gray-500">Số lượng:</span>
                                    <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50 shadow-md">
                                        <button onClick={decreaseQuantity} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 transition-all duration-300" disabled={quantity <= 1}><FaMinus className="text-base" /></button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={book.stockCount}
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            className="w-12 text-center border-0 focus:ring-0 focus:outline-none bg-transparent text-xs sm:text-sm"
                                            disabled={book.stockCount === 0}
                                        />
                                        <button onClick={increaseQuantity} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 transition-all duration-300" disabled={quantity >= book.stockCount}><FaPlus className="text-base" /></button>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAddToCart}
                                    variant="primary"
                                    size="md"
                                    disabled={book.stockCount === 0 || quantity === 0 || cartLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg text-sm sm:text-base"
                                >
                                    <FaShoppingCart /> Thêm vào giỏ hàng
                                </Button>
                                
                            </div>
                            <div className="mb-2">
                                <span className="text-xs sm:text-sm text-gray-500">Thể loại:</span>
                                <span className="ml-2 font-semibold text-blue-700 text-sm sm:text-base">{book.category?.name || 'Chưa xác định'}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-xs sm:text-sm text-gray-500">Tác giả:</span>
                                <span className="ml-2 font-semibold text-blue-700 text-sm sm:text-base">{book.author?.name || 'Chưa xác định'}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-xs sm:text-sm text-gray-500">Nhà xuất bản:</span>
                                <span className="ml-2 font-semibold text-blue-700 text-sm sm:text-base">{book.publisher?.name || 'Chưa xác định'}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-xs sm:text-sm text-gray-500">Số lượng còn lại:</span>
                                <span className="ml-2 font-semibold text-green-700 text-sm sm:text-base">{book.stockCount ?? 0}</span>
                            </div>
                            <div className="mb-4">
                                <span className="text-xs sm:text-sm text-gray-500">Mô tả:</span>
                                <span className="ml-2 text-gray-800 leading-relaxed text-xs sm:text-sm">
                                    {showFullDescription || (book.description?.length || 0) < 200
                                        ? book.description
                                        : `${book.description?.slice(0, 200)}...`}
                                    {book.description && book.description.length > 200 && (
                                        <button
                                            className="ml-2 text-blue-600 hover:underline text-xs sm:text-sm font-semibold transition duration-200"
                                            onClick={() => setShowFullDescription((prev) => !prev)}
                                        >
                                            {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                                        </button>
                                    )}
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
                {/* Đánh giá & Nhận xét: full width */}
                <div className="mt-8">
                    <Card className="p-6 sm:p-10 bg-gradient-to-br from-white to-gray-50 shadow-xl w-full">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">Đánh giá & Nhận xét</h2>
                       
                        <ReviewSection bookId={book._id} bookRating={book} refetchBook={refetchBook} />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;