import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllBooks } from '../../features/book/bookSlice';
import { getAllCategories } from '../../features/category/categorySlice';
import { getAllAuthors } from '../../features/author/authorSlice'; // Giả định có slice cho tác giả
import { getAllPublishers } from '../../features/publisher/publisherSlice'; // Giả định có slice cho nhà xuất bản
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaTimes, FaSort, FaChevronDown } from 'react-icons/fa';


const BookStorePage = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { books, loading, error, pagination } = useSelector((state) => state.book);
    const { categories } = useSelector((state) => state.category);
    const { authors } = useSelector((state) => state.author || {});
    const { publishers } = useSelector((state) => state.publisher || {});
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Quản lý trạng thái
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: [],
        author: [],
        publisher: [],
        priceRange: { min: 0, max: Infinity },
        availability: [],
        sort: 'createdAt:desc',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Đọc tham số truy vấn từ URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        const category = params.get('category') ? params.get('category').split(',') : [];
        const author = params.get('author') ? params.get('author').split(',') : [];
        const publisher = params.get('publisher') ? params.get('publisher').split(',') : [];

        setSearchQuery(query);
        setFilters((prev) => ({
            ...prev,
            category,
            author,
            publisher,
        }));
        setCurrentPage(1);
    }, [location.search]);

    // Cập nhật URL khi bộ lọc thay đổi
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (filters.category.length > 0) params.set('category', filters.category.join(','));
        if (filters.author.length > 0) params.set('author', filters.author.join(','));
        if (filters.publisher.length > 0) params.set('publisher', filters.publisher.join(','));
        const newUrl = `/bookstore?${params.toString()}`;
        navigate(newUrl, { replace: true });
    }, [filters.category, filters.author, filters.publisher, searchQuery, navigate]);

    // useEffect chỉ lấy categories, authors, publishers khi mount
    useEffect(() => {
        dispatch(getAllCategories());
        dispatch(getAllAuthors());
        dispatch(getAllPublishers());
    }, [dispatch]);

    // useEffect lấy sách khi filter/search/page thay đổi
    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line
    }, [currentPage, filters]);

    // Hàm fetchBooks không dùng useMemo nữa
    const fetchBooks = () => {
        const params = {
            q: searchQuery || undefined,
            category: filters.category.length > 0 ? filters.category.join(',') : undefined,
            author: filters.author.length > 0 ? filters.author.join(',') : undefined,
            publisher: filters.publisher.length > 0 ? filters.publisher.join(',') : undefined,
            minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
            maxPrice: filters.priceRange.max !== Infinity ? filters.priceRange.max : undefined,
            available: filters.availability.length ? filters.availability[0] : undefined,
            sort: filters.sort,
            page: currentPage,
            limit: 10,
        };
        Object.keys(params).forEach((key) => params[key] === undefined && delete params[key]);
        dispatch(getAllBooks(params));
    };

    // Xử lý lỗi
    useEffect(() => {
        if (error) {
            console.error('Lỗi lấy sách:', error);
            toast.error(error);
        }
    }, [error]);

    // Xử lý tìm kiếm
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBooks();
    };

    // Xử lý bộ lọc
    const handleFilterChange = (type, value) => {
        setFilters((prev) => {
            if (type === 'category' || type === 'author' || type === 'publisher') {
                const currentValues = prev[type];
                return {
                    ...prev,
                    [type]: currentValues.includes(value)
                        ? currentValues.filter((v) => v !== value)
                        : [...currentValues, value],
                };
            }
            if (type === 'availability') {
                return {
                    ...prev,
                    availability: prev.availability.includes(value) ? [] : [value],
                };
            }
            if (type === 'sort') {
                return {
                    ...prev,
                    sort: value,
                };
            }
            return prev;
        });
        setCurrentPage(1);
    };

    const handlePriceRangeChange = (type, value) => {
        // Không cho phép nhập số âm hoặc dấu -
        let sanitized = value.replace(/[^\d]/g, '');
        if (sanitized === '') sanitized = '';
        else sanitized = String(Math.max(0, parseInt(sanitized, 10)));
        setFilters((prev) => ({
            ...prev,
            priceRange: {
                ...prev.priceRange,
                [type]: sanitized === '' ? '' : parseInt(sanitized, 10),
            },
        }));
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({
            category: [],
            author: [],
            publisher: [],
            priceRange: { min: 0, max: Infinity },
            availability: [],
            sort: 'createdAt:desc',
        });
        setSearchQuery('');
        setCurrentPage(1);
    };

    const isFilterActive = useMemo(() => {
        return (
            filters.category.length > 0 ||
            filters.author.length > 0 ||
            filters.publisher.length > 0 ||
            filters.priceRange.min !== 0 ||
            filters.priceRange.max !== Infinity ||
            filters.availability.length > 0 ||
            searchQuery ||
            filters.sort !== 'createdAt:desc'
        );
    }, [filters, searchQuery]);

    // Thêm vào BookCard hoặc nơi có nút thêm vào giỏ hàng:
    // onClick={() => handleAddToCart(book)}
    const handleAddToCart = (book, quantity = 1) => {
        if (!book.availability || book.stockCount === 0) {
            toast.error('Sách hiện đang hết hàng!');
            return;
        }
        if (!isAuthenticated) {
            toast.info('Bạn vui lòng đăng nhập hoặc đăng ký tài khoản để thêm vào giỏ hàng.');
            return;
        }
        dispatch({ type: 'cart/addToCart', payload: { bookId: book._id, quantity } });
        toast.success('Đã thêm vào giỏ hàng!');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                {/* Tiêu đề */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Cửa hàng sách</h1>
                    <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm sách theo tên, tác giả, NXB..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full p-4 pl-12 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                            />
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        {/* <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition duration-300"
                        >
                            <FaFilter />
                            <span>Bộ lọc</span>
                            {isFilterActive && (
                                <span className="bg-white text-blue-600 text-xs px-2 py-1 rounded-full">
                                    {filters.category.length +
                                        filters.author.length +
                                        filters.publisher.length +
                                        (filters.availability.length ? 1 : 0) +
                                        (filters.priceRange.min || filters.priceRange.max !== Infinity ? 1 : 0)}
                                </span>
                            )}
                        </button> */}
                    </form>
                </div>

                {/* Bộ lọc đang hoạt động */}
                {isFilterActive && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filters.category.map((catId) => {
                            const category = categories.find((c) => c._id === catId);
                            return (
                                category && (
                                    <span
                                        key={catId}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {category.name}
                                        <button onClick={() => handleFilterChange('category', catId)}>
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </span>
                                )
                            );
                        })}
                        {filters.author.map((authId) => {
                            const author = authors.find((a) => a._id === authId);
                            return (
                                author && (
                                    <span
                                        key={authId}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {author.name}
                                        <button onClick={() => handleFilterChange('author', authId)}>
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </span>
                                )
                            );
                        })}
                        {filters.publisher.map((pubId) => {
                            const publisher = publishers.find((p) => p._id === pubId);
                            return (
                                publisher && (
                                    <span
                                        key={pubId}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                        {publisher.name}
                                        <button onClick={() => handleFilterChange('publisher', pubId)}>
                                            <FaTimes className="text-xs" />
                                        </button>
                                    </span>
                                )
                            );
                        })}
                        {(filters.priceRange.min > 0 || filters.priceRange.max !== Infinity) && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                Giá: {filters.priceRange.min > 0 ? `${filters.priceRange.min.toLocaleString('vi-VN')}đ` : '0đ'} -{' '}
                                {filters.priceRange.max !== Infinity ? `${filters.priceRange.max.toLocaleString('vi-VN')}đ` : '∞'}
                                <button onClick={() => setFilters((prev) => ({ ...prev, priceRange: { min: 0, max: Infinity } }))}>
                                    <FaTimes className="text-xs" />
                                </button>
                            </span>
                        )}
                        {filters.availability.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                Còn hàng
                                <button onClick={() => setFilters((prev) => ({ ...prev, availability: [] }))}>
                                    <FaTimes className="text-xs" />
                                </button>
                            </span>
                        )}
                        <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <FaTimes /> Xóa tất cả
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Thanh bên bộ lọc */}
                    <aside
                        className={`lg:col-span-1 bg-white p-6 rounded-lg shadow-lg space-y-6 transition-all duration-300 ${showFilters ? 'block fixed inset-0 z-50 p-6 bg-white overflow-y-auto' : 'hidden lg:block'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Bộ lọc</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="lg:hidden text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {/* Tùy chọn sắp xếp */}
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Sắp xếp</h4>
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="createdAt:desc">Mới nhất</option>
                                <option value="price:asc">Giá tăng dần</option>
                                <option value="price:desc">Giá giảm dần</option>
                                <option value="title:asc">Tên A-Z</option>
                            </select>
                        </div>

                        {/* Danh mục */}
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Danh mục</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`category-${cat._id}`}
                                            value={cat._id}
                                            checked={filters.category.includes(cat._id)}
                                            onChange={() => handleFilterChange('category', cat._id)}
                                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor={`category-${cat._id}`} className="ml-3 text-sm text-gray-700">
                                            {cat.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tác giả */}
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Tác giả</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {authors && authors.length > 0 ? (
                                    authors.map((auth) => (
                                        <div key={auth._id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`author-${auth._id}`}
                                                value={auth._id}
                                                checked={filters.author.includes(auth._id)}
                                                onChange={() => handleFilterChange('author', auth._id)}
                                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={`author-${auth._id}`} className="ml-3 text-sm text-gray-700">
                                                {auth.name}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">Không có tác giả</p>
                                )}
                            </div>
                        </div>

                        {/* Nhà xuất bản */}
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Nhà xuất bản</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {publishers && publishers.length > 0 ? (
                                    publishers.map((pub) => (
                                        <div key={pub._id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`publisher-${pub._id}`}
                                                value={pub._id}
                                                checked={filters.publisher.includes(pub._id)}
                                                onChange={() => handleFilterChange('publisher', pub._id)}
                                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={`publisher-${pub._id}`} className="ml-3 text-sm text-gray-700">
                                                {pub.name}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-600">Không có nhà xuất bản</p>
                                )}
                            </div>
                        </div>

                        {/* Khoảng giá */}
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Khoảng giá</h4>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    placeholder="Từ"
                                    value={filters.priceRange.min === 0 ? '' : filters.priceRange.min}
                                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                                    className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="number"
                                    placeholder="Đến"
                                    value={filters.priceRange.max === Infinity ? '' : filters.priceRange.max}
                                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                                    className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <h4 className="font-semibold mb-3 text-gray-700">Trạng thái</h4>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="availability-true"
                                    value="true"
                                    checked={filters.availability.includes('true')}
                                    onChange={() => handleFilterChange('availability', 'true')}
                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="availability-true" className="ml-3 text-sm text-gray-700">
                                    Còn hàng
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Lưới sách */}
                    <main className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">Danh sách sách</h2>
                            <p className="text-gray-600">{pagination.totalItems} sách được tìm thấy</p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                                    >
                                        <div className="h-48 bg-gray-200"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : books.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {books.map((book) => (
                                    <Link
                                        to={`/bookstore/${book._id}`}
                                        key={book._id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                                    >
                                        <div className="relative">
                                            <img
                                                src={`${import.meta.env.VITE_BOOK_SERVICE}/${book.images[0]?.path || 'Uploads/default-image.jpg'}`}
                                                alt={book.title}
                                            loading="lazy" // Thêm thuộc tính này
                                                className="w-full h-40 object-contain"
                                            />
                                            {!book.availability && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-xs rounded-full">
                                                    Hết hàng
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                                                {book.title}
                                            </h3>
                                            {(() => {
                                                const price = book.finalPrice !== undefined ? book.finalPrice : book.price;
                                                return (
                                                    <p className="text-green-600 font-bold text-lg">
                                                        {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                    </p>
                                                );
                                            })()}
                                            <div className="mt-2 text-sm text-gray-600">
                                                <p>Tác giả: {book.author?.name || 'Không xác định'}</p>
                                                <p>Nhà xuất bản: {book.publisher?.name || 'Không xác định'}</p>
                                                <p>Danh mục: {book.category?.name || 'Không xác định'}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-600 text-lg">Không tìm thấy sách phù hợp.</p>
                                <button onClick={resetFilters} className="mt-4 text-blue-600 hover:underline">
                                    Xóa bộ lọc và thử lại
                                </button>
                            </div>
                        )}

                        {/* Phân trang */}
                        {pagination.totalPages >0 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition duration-300"
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`px-4 py-2 rounded-lg transition duration-300 ${currentPage === i + 1
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 border hover:bg-gray-100'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                                        disabled={currentPage === pagination.totalPages}
                                        className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition duration-300"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BookStorePage;