import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBookById, updateBook, clearSelectedBook } from '../../../features/book/bookSlice';
import { getAllCategories } from '../../../features/category/categorySlice';
import { getAllAuthors } from '../../../features/author/authorSlice';
import { getAllPublishers } from '../../../features/publisher/publisherSlice';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaEdit, FaBook, FaPenFancy, FaTags, FaBuilding, FaDollarSign, FaBoxes, FaImage, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const AdminEditBookPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedBook, loading, error } = useSelector((state) => state.book);
    const { categories } = useSelector((state) => state.category);
    const { authors } = useSelector((state) => state.author);
    const { publishers } = useSelector((state) => state.publisher);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        publisher: '',
        author: '',
        availability: 'true',
        stockCount: '',
        // images: [], // Sẽ không dùng trực tiếp trong formData nữa
        keepExistingImages: 'true', // Mặc định là giữ ảnh cũ
    });

    const [existingImageDetails, setExistingImageDetails] = useState([]); // Chi tiết ảnh đang có của sách
    const [newSelectedFiles, setNewSelectedFiles] = useState([]); // Các file ảnh mới được chọn từ máy tính
    const [newImagePreviews, setNewImagePreviews] = useState([]); // URL preview của ảnh mới
    const baseUrl = import.meta.env.VITE_BOOK_SERVICE || '';

    // Fetch dữ liệu cần thiết khi component mount hoặc ID sách thay đổi
    useEffect(() => {
        dispatch(getBookById(id));
        dispatch(getAllCategories());
        dispatch(getAllAuthors());
        dispatch(getAllPublishers());
        // dispatch(getAllImages({ limit: 0 })); // KHÔNG CẦN NỮA
        return () => {
            dispatch(clearSelectedBook());
            // Clear Object URLs khi unmount
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [dispatch, id]);

    // Đồng bộ formData và existingImageDetails với selectedBook
    useEffect(() => {
        if (selectedBook) {
            setFormData({
                title: selectedBook.title || '',
                description: selectedBook.description || '',
                price: selectedBook.price !== undefined ? selectedBook.price.toString() : '',
                category: selectedBook.category?._id || '',
                publisher: selectedBook.publisher?._id || '',
                author: selectedBook.author?._id || '',
                availability: selectedBook.availability ? 'true' : 'false',
                stockCount: selectedBook.stockCount !== undefined ? selectedBook.stockCount.toString() : '',
                keepExistingImages: 'true', // Reset về true mỗi khi load sách mới
            });
            // Lưu chi tiết các ảnh hiện có của sách
            setExistingImageDetails(selectedBook.images || []);
        }
    }, [selectedBook]);

    // Tạo preview cho các file ảnh mới được chọn
    useEffect(() => {
        const previews = newSelectedFiles.map(file => URL.createObjectURL(file));
        setNewImagePreviews(previews);

        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newSelectedFiles]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
        }));
    };

    // Xử lý thay đổi file input cho ảnh mới
    const handleNewFileChange = (e) => {
        const files = Array.from(e.target.files);
        setNewSelectedFiles(files);
    };

    // Xóa một ảnh đang có của sách (tức là ảnh cũ, không phải ảnh mới tải lên)
    const handleRemoveExistingImage = (imageIdToRemove) => {
        setExistingImageDetails(prevDetails => prevDetails.filter(img => img._id !== imageIdToRemove));
        // Đảm bảo ID ảnh này không còn được gửi lên trong request nếu keepExistingImages là true
        // Cách hiện tại, chúng ta sẽ xây dựng lại mảng ID ảnh từ `existingImageDetails` và `newSelectedFiles` khi submit
    };

    // Xóa một ảnh mới được chọn (trước khi submit)
    const handleRemoveNewImage = (indexToRemove) => {
        setNewSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim() || !formData.description.trim() || formData.price === '' ||
            formData.stockCount === '' || !formData.category || !formData.publisher || !formData.author) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        // Kiểm tra tổng số ảnh sau khi xử lý logic keepExistingImages
        let totalImagesAfterUpdate = [];
        if (formData.keepExistingImages === 'true') {
            totalImagesAfterUpdate = existingImageDetails.map(img => img._id); // Lấy ID của ảnh cũ còn lại
        }
        if (newSelectedFiles.length > 0) {
            // Không thể thêm File objects trực tiếp vào totalImagesAfterUpdate vì chúng không phải ID
            // Việc thêm ảnh mới sẽ được xử lý bằng FormData
        }

        if (totalImagesAfterUpdate.length === 0 && newSelectedFiles.length === 0) {
            toast.error('Vui lòng cung cấp ít nhất một ảnh cho sách.');
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            toast.error('Giá sách phải lớn hơn 0.');
            return;
        }
        if (parseInt(formData.stockCount) < 0) {
            toast.error('Số lượng tồn kho không thể âm.');
            return;
        }

        // Tạo FormData để gửi dữ liệu và file
        const dataToSend = new FormData();
        for (const key in formData) {
            dataToSend.append(key, formData[key]);
        }
        // Đặc biệt xử lý trường `images`:
        // Nếu `keepExistingImages` là true, gửi các ID ảnh cũ còn lại
        if (formData.keepExistingImages === 'true') {
            existingImageDetails.forEach(img => {
                dataToSend.append('images', img._id); // Gửi ID của ảnh cũ
            });
        }
        // Luôn append các file ảnh mới
        newSelectedFiles.forEach((file) => {
            dataToSend.append('images', file); // 'images' là tên trường mà Multer mong đợi
        });

        try {
            await dispatch(updateBook({ id, bookData: dataToSend })).unwrap();
            toast.success('Cập nhật sách thành công!');
            navigate('/admin/books');
        } catch (err) {
            console.error('Update book failed:', err);
        }
    };

    if (loading && !selectedBook) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-blue-700 animate-pulse">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-semibold">Đang tải dữ liệu sách...</p>
                </div>
            </div>
        );
    }

    if (error && !selectedBook) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="text-center text-red-700">
                    <h2 className="text-2xl font-bold mb-2">Lỗi!</h2>
                    <p>{error || "Không thể tải thông tin sách."}</p>
                    <Button onClick={() => navigate('/admin/books')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Quay lại danh sách</Button>
                </div>
            </div>
        );
    }

    if (!selectedBook) return null;

    // Tổng số ảnh để validate (ảnh cũ còn lại + ảnh mới)
    const currentTotalImages = (formData.keepExistingImages === 'true' ? existingImageDetails.length : 0) + newSelectedFiles.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaEdit className="text-5xl" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-center leading-tight">Chỉnh sửa Sách</h1>
                    <p className="text-blue-100 text-center mt-2">Cập nhật thông tin chi tiết cho cuốn sách này.</p>
                </div>
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Sách</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="Tiêu đề sách"
                                    id="title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Nhập tiêu đề sách"
                                    required
                                    icon={FaBook}
                                />
                            </div>
                            {/* Các trường khác giữ nguyên, loại bỏ trường mô tả khỏi grid này */}
                            <div>
                                <Input
                                    label="Giá"
                                    id="price"
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Nhập giá sách"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    icon={FaDollarSign}
                                />
                            </div>
                            <div>
                                <Input
                                    label="Số lượng tồn kho"
                                    id="stockCount"
                                    type="number"
                                    name="stockCount"
                                    value={formData.stockCount}
                                    onChange={handleChange}
                                    placeholder="Nhập số lượng tồn kho"
                                    required
                                    min="0"
                                    icon={FaBoxes}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaTags className="mr-2 text-blue-600" /> Danh mục <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white appearance-none pr-10 transition duration-200"
                                        required
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="author" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaPenFancy className="mr-2 text-blue-600" /> Tác giả <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="author"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white appearance-none pr-10 transition duration-200"
                                        required
                                    >
                                        <option value="">Chọn tác giả</option>
                                        {authors.map(auth => (
                                            <option key={auth._id} value={auth._id}>{auth.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="publisher" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaBuilding className="mr-2 text-blue-600" /> Nhà xuất bản <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="publisher"
                                        name="publisher"
                                        value={formData.publisher}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white appearance-none pr-10 transition duration-200"
                                        required
                                    >
                                        <option value="">Chọn nhà xuất bản</option>
                                        {publishers.map(pub => (
                                            <option key={pub._id} value={pub._id}>{pub.name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="availability" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaCheckCircle className="mr-2 text-blue-600" /> Trạng thái còn hàng
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        id="availability"
                                        type="checkbox"
                                        name="availability"
                                        className="sr-only peer"
                                        checked={formData.availability === 'true'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.checked ? 'true' : 'false' }))}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900">
                                        {formData.availability === 'true' ? 'Còn hàng' : 'Hết hàng'}
                                    </span>
                                </label>
                            </div>
                            <div>
                                <label htmlFor="keepExistingImages" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaImage className="mr-2 text-blue-600" /> Giữ ảnh hiện tại
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        id="keepExistingImages"
                                        type="checkbox"
                                        name="keepExistingImages"
                                        className="sr-only peer"
                                        checked={formData.keepExistingImages === 'true'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, keepExistingImages: e.target.checked ? 'true' : 'false' }))}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900">
                                        {formData.keepExistingImages === 'true' ? 'Giữ ảnh cũ' : 'Thay thế ảnh'}
                                    </span>
                                </label>
                            </div>
                        </div>
                        {/* Thêm textarea mô tả ở một hàng riêng */}
                        <div>
                            <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">Mô tả <span className="text-red-500">*</span></label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Mô tả ngắn gọn về sách"
                                rows={4}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition duration-200 resize-y min-h-[100px]"
                            />
                        </div>
                        {/* Phần quản lý ảnh */}
                        <div className="mt-6 border-t pt-6 border-gray-200">
                            <label className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                <FaImage className="mr-2 text-blue-600" /> Ảnh sách <span className="text-red-500 ml-1">*</span>
                            </label>
                            {/* Hiển thị ảnh đang có của sách (nếu `keepExistingImages` là true) */}
                            {formData.keepExistingImages === 'true' && existingImageDetails.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-md font-medium text-gray-700 mb-2">Ảnh hiện có:</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                                        {existingImageDetails.map(img => (
                                            <div key={img._id} className="relative w-full h-24 rounded-md overflow-hidden border border-gray-300 shadow-sm group">
                                                <img
                                                    src={`${baseUrl}/${img.path}`}
                                                    alt={img.filename}
                                                    className="object-cover w-full h-full"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/F3F4F6/9CA3AF?text=Error'; }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(img._id)}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Gỡ ảnh này"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input để tải ảnh mới */}
                            <h4 className="text-md font-medium text-gray-700 mb-2">Tải lên ảnh mới:</h4>
                            <input
                                id="newImageUpload"
                                type="file"
                                name="images" // Tên trường này phải khớp với Multer trong backend
                                accept="image/*"
                                multiple
                                onChange={handleNewFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {/* Preview các ảnh mới được chọn từ máy tính */}
                            {newImagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                                    {newImagePreviews.map((src, index) => (
                                        <div key={index} className="relative w-full h-24 rounded-md overflow-hidden border border-gray-300 shadow-sm group">
                                            <img
                                                src={src}
                                                alt={`New Preview ${index}`}
                                                className="object-cover w-full h-full"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/F3F4F6/9CA3AF?text=Error'; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewImage(index)}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Gỡ ảnh này"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang cập nhật sách...' : 'Cập Nhật Sách'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditBookPage;