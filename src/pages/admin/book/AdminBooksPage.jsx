import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllBooks, deleteBook } from '../../../features/book/bookSlice';
import { getAllCategories } from '../../../features/category/categorySlice';
import { getAllAuthors } from '../../../features/author/authorSlice';
import { getAllPublishers } from '../../../features/publisher/publisherSlice';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import {
    FaPlus, FaTrash, FaEdit, FaSearch, FaBook, FaFilter, FaSortAlphaDown, FaSortAlphaUp, FaDollarSign, FaBoxes, FaTimes, FaSortAmountDown, FaSortAmountUp, FaWarehouse, FaUndo
} from 'react-icons/fa';
import { MdOutlineBook } from 'react-icons/md';
import bookService from '../../../services/bookService';

const AdminBooksPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { books, loading, error, pagination } = useSelector((state) => state.book);
    const { categories } = useSelector((state) => state.category);
    const { authors } = useSelector((state) => state.author);
    const { publishers } = useSelector((state) => state.publisher);
    // console.log("Current pagination state:", pagination); // Để debug pagination

    const [currentPage, setCurrentPage] = useState(pagination.currentPage || 1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterAuthor, setFilterAuthor] = useState('');
    const [filterPublisher, setFilterPublisher] = useState('');
    const [filterAvailability, setFilterAvailability] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('-1'); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [bookToUpdateStock, setBookToUpdateStock] = useState(null);
    const [stockInput, setStockInput] = useState('');
    const [stockLoading, setStockLoading] = useState(false);
    const [stockError, setStockError] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');

    // baseUrl dùng cho việc hiển thị ảnh từ backend
    const baseUrl = import.meta.env.VITE_BOOK_SERVICE || '';


    // `fetchBooks` được wrap trong useCallback để tránh re-render không cần thiết
    const fetchBooks = useCallback(() => {
        const params = {
            page: currentPage,
            limit: 10, // Số lượng sách trên mỗi trang
            q: searchTerm,
            // Định dạng sort: "trường:hướng" ví dụ "createdAt:desc" hoặc "title:asc"
            sort: `${sortBy}:${sortOrder === '1' ? 'asc' : 'desc'}`,
        };

        // Thêm các tham số lọc nếu chúng có giá trị
        if (filterCategory) params.category = filterCategory;
        if (filterAuthor) params.author = filterAuthor;
        if (filterPublisher) params.publisher = filterPublisher;
        if (filterAvailability !== 'all') params.available = filterAvailability;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;

        if (statusFilter === 'deleted') {
            params.status = 'deleted';
            dispatch(getAllBooks(params));
        } else if (statusFilter === 'all') {
            params.status = 'all';
            dispatch(getAllBooks(params));
        } else {
            params.status = 'active';
            dispatch(getAllBooks(params));
        }
    }, [dispatch, currentPage, searchTerm, filterCategory, filterAuthor, filterPublisher, filterAvailability, minPrice, maxPrice, sortBy, sortOrder, statusFilter]);

    // Effect để gọi API khi các dependencies thay đổi
    useEffect(() => {
        fetchBooks(); // Lấy danh sách sách với các bộ lọc và phân trang
        dispatch(getAllCategories()); // Lấy danh mục
        dispatch(getAllAuthors());     // Lấy tác giả
        dispatch(getAllPublishers());  // Lấy nhà xuất bản
    }, [fetchBooks, dispatch]);

    // Effect để hiển thị lỗi từ Redux state
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Xử lý khi nhấn nút xóa sách
    const handleDeleteBook = (bookId) => {
        setBookToDelete(bookId);
        setIsDeleteModalOpen(true);
    };

    // Xác nhận và thực hiện xóa sách
    const confirmDeleteBook = async () => {
        try {
            await dispatch(deleteBook(bookToDelete)).unwrap();
            fetchBooks(); 
            setIsDeleteModalOpen(false);
            setBookToDelete(null);
        } catch (err) {
            // Lỗi đã được xử lý bởi `toast.error` trong Redux thunk (nếu có)
            console.error('Delete book error:', err);
        }
    };

    // Thay đổi trang
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Xử lý thay đổi bộ lọc (đặt lại trang về 1)
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
    };

    // Xử lý thay đổi sắp xếp (đặt lại trang về 1)
    const handleSortChange = (e) => {
        const [newSortBy, newSortOrder] = e.target.value.split(',');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi sắp xếp
    };

    const handleOpenStockModal = (book) => {
        setBookToUpdateStock(book);
        setStockInput('');
        setStockError('');
        setIsStockModalOpen(true);
    };
    const handleUpdateStock = async () => {
        setStockError('');
        if (!stockInput || isNaN(stockInput)) {
            setStockError('Vui lòng nhập số lượng hợp lệ!');
            return;
        }
        setStockLoading(true);
        try {
            await bookService.updateBookStock(bookToUpdateStock._id, Number(stockInput));
            toast.success('Cập nhật tồn kho thành công!');
            setIsStockModalOpen(false);
            setBookToUpdateStock(null);
            setStockInput('');
            fetchBooks();
        } catch (err) {
            setStockError(err.response?.data?.message || err.message || 'Lỗi cập nhật tồn kho!');
        } finally {
            setStockLoading(false);
        }
    };

    const handleRestoreBook = async (bookId) => {
        try {
            await bookService.restoreBook(bookId);
            toast.success('Khôi phục sách thành công!');
            fetchBooks();
        } catch (err) {
            toast.error('Khôi phục sách thất bại!');
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-xl mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center">
                    <FaBook className="mr-3 text-blue-600" /> Quản lý Sách
                </h1>
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề, tác giả, NXB..."
                        value={searchTerm}
                        onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                        icon={FaSearch}
                        className="!w-64"
                    />
                    <Button
                        onClick={() => navigate('/admin/books/create')}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <FaPlus className="mr-2" /> Thêm Sách
                    </Button>
                </div>
            </div>

            {/* Khu vực Bộ lọc và Sắp xếp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                {/* Lọc theo Danh mục */}
                <div>
                    <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Danh mục:</label>
                    <select
                        id="categoryFilter"
                        value={filterCategory}
                        onChange={(e) => handleFilterChange(setFilterCategory, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Tất cả</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                {/* Lọc theo Tác giả */}
                <div>
                    <label htmlFor="authorFilter" className="block text-sm font-medium text-gray-700 mb-1">Tác giả:</label>
                    <select
                        id="authorFilter"
                        value={filterAuthor}
                        onChange={(e) => handleFilterChange(setFilterAuthor, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Tất cả</option>
                        {authors.map(auth => (
                            <option key={auth._id} value={auth._id}>{auth.name}</option>
                        ))}
                    </select>
                </div>
                {/* Lọc theo Nhà xuất bản */}
                <div>
                    <label htmlFor="publisherFilter" className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản:</label>
                    <select
                        id="publisherFilter"
                        value={filterPublisher}
                        onChange={(e) => handleFilterChange(setFilterPublisher, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Tất cả</option>
                        {publishers.map(pub => (
                            <option key={pub._id} value={pub._id}>{pub.name}</option>
                        ))}
                    </select>
                </div>
                {/* Lọc theo Trạng thái còn hàng */}
                <div>
                    <label htmlFor="availabilityFilter" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái:</label>
                    <select
                        id="availabilityFilter"
                        value={filterAvailability}
                        onChange={(e) => handleFilterChange(setFilterAvailability, e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="all">Tất cả</option>
                        <option value="true">Còn hàng</option>
                        <option value="false">Hết hàng</option>
                    </select>
                </div>
                {/* Lọc theo khoảng Giá */}
                <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Giá từ:</label>
                    <Input
                        id="minPrice"
                        type="number"
                        value={minPrice}
                        onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
                        placeholder="Min giá"
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Giá đến:</label>
                    <Input
                        id="maxPrice"
                        type="number"
                        value={maxPrice}
                        onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
                        placeholder="Max giá"
                        className="w-full"
                    />
                </div>
                {/* Lọc theo trạng thái */}
                <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái:</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="active">Đang hoạt động</option>
                        <option value="deleted">Đã xóa mềm</option>
                        <option value="all">Tất cả</option>
                    </select>
                </div>
                {/* Sắp xếp */}
                <div className="sm:col-span-2 md:col-span-1">
                    <label htmlFor="sortBySelect" className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo:</label>
                    <div className="relative">
                        <select
                            id="sortBySelect"
                            value={`${sortBy},${sortOrder}`}
                            onChange={handleSortChange}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="createdAt,-1">Ngày tạo (Mới nhất)</option>
                            <option value="createdAt,1">Ngày tạo (Cũ nhất)</option>
                            <option value="title,1">Tiêu đề (A-Z)</option>
                            <option value="title,-1">Tiêu đề (Z-A)</option>
                            <option value="price,1">Giá (Thấp đến Cao)</option>
                            <option value="price,-1">Giá (Cao đến Thấp)</option>
                            <option value="stockCount,1">Số lượng (Thấp đến Cao)</option>
                            <option value="stockCount,-1">Số lượng (Cao đến Thấp)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            {/* Hiển thị icon sắp xếp tương ứng */}
                            {sortBy === 'createdAt' && (sortOrder === '-1' ? <FaSortAmountDown /> : <FaSortAmountUp />)}
                            {sortBy === 'title' && (sortOrder === '1' ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
                            {sortBy === 'price' && (sortOrder === '1' ? <FaDollarSign /> : <FaDollarSign />)}
                            {sortBy === 'stockCount' && (sortOrder === '1' ? <FaBoxes /> : <FaBoxes />)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hiển thị trạng thái tải hoặc thông báo trống */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl text-gray-600 animate-pulse">Đang tải danh sách sách...</p>
                </div>
            ) : books.length === 0 ? (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-600 flex items-center">
                        <FaTimes className="mr-2 text-red-500" /> Không tìm thấy sách nào.
                    </p>
                </div>
            ) : (
                <>
                    {/* Bảng hiển thị sách */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ảnh</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tiêu đề</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tác giả</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Danh mục</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NXB</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Giá</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tồn kho</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {books.map((book) => (
                                        <tr key={book._id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-md overflow-hidden bg-gray-200">
                                                    {/* Hiển thị ảnh đầu tiên của sách nếu có */}
                                                    {book.images && book.images.length > 0 && book.images[0].path ? (
                                                        <img
                                                            src={`${baseUrl}/${book.images[0].path}`}
                                                            alt={book.title}
                                                            className="object-cover w-full h-full"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/F3F4F6/9CA3AF?text=Error'; }}
                                                        />
                                                    ) : (
                                                        <MdOutlineBook className="text-gray-400 text-2xl" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 line-clamp-2">{book.title}</td>
                                            {/* Đảm bảo kiểm tra book.author và book.publisher trước khi truy cập .name */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author ? book.author.name : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.category ? book.category.name : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.publisher ? book.publisher.name : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.price?.toLocaleString() || '0'} VNĐ</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.stockCount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {book.availability ? 'Còn hàng' : 'Hết hàng'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-3">
                                                    {(statusFilter === 'deleted' || (statusFilter === 'all' && book.status === 'deleted')) ? (
                                                        <Button
                                                            onClick={() => handleRestoreBook(book._id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                                                        >
                                                            <FaUndo className="mr-2" /> Khôi phục
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                onClick={() => navigate(`/admin/books/edit/${book._id}`)}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
                                                            >
                                                                <FaEdit className="mr-2" /> Sửa
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeleteBook(book._id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                                                            >
                                                                <FaTrash className="mr-2" /> Xóa
                                                            </Button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition duration-150"
                                                        onClick={() => handleOpenStockModal(book)}
                                                        title="Cập nhật tồn kho"
                                                    >
                                                        <FaWarehouse className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Phân trang */}
                    {pagination && pagination.totalPages > 0 && (
                        <div className="mt-8 flex justify-center items-center space-x-3">
                            {/* Nút Previous (tùy chọn) */}
                            {/* <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Trước
                            </button> */}
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((number) => (
                                <button
                                    key={number}
                                    onClick={() => handlePageChange(number)}
                                    className={`px-4 py-2 rounded-full font-semibold transition duration-300 ${pagination.currentPage === number ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {number}
                                </button>
                            ))}
                            {/* Nút Next (tùy chọn) */}
                            {/* <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4 py-2 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Tiếp
                            </button> */}
                        </div>
                    )}
                </>
            )}

            {/* Modal xác nhận xóa */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-11/12 max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa sách này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end space-x-4">
                            <Button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={confirmDeleteBook}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal cập nhật tồn kho */}
            {isStockModalOpen && bookToUpdateStock && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-11/12 max-w-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Cập nhật tồn kho</h3>
                        <div className="mb-4">
                            <div className="font-semibold mb-1">{bookToUpdateStock.title}</div>
                            <div className="text-gray-600 mb-2">Tồn kho hiện tại: <span className="font-bold">{bookToUpdateStock.stockCount}</span></div>
                            <input
                                type="number"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập số lượng muốn tăng (+) hoặc giảm (-)"
                                value={stockInput}
                                onChange={e => setStockInput(e.target.value)}
                                disabled={stockLoading}
                            />
                            {stockError && <div className="text-red-500 text-sm mt-1">{stockError}</div>}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button
                                onClick={() => setIsStockModalOpen(false)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                                disabled={stockLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleUpdateStock}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg"
                                loading={stockLoading}
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooksPage;