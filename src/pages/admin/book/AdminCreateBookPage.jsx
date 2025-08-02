import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addBook } from '../../../features/book/bookSlice';
import { getAllCategories } from '../../../features/category/categorySlice';
import { getAllAuthors } from '../../../features/author/authorSlice';
import { getAllPublishers } from '../../../features/publisher/publisherSlice';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaBook, FaPenFancy, FaTags, FaBuilding, FaDollarSign, FaBoxes, FaImage, FaCheckCircle, FaTimes } from 'react-icons/fa';

const AdminCreateBookPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.book);
    const { categories } = useSelector((state) => state.category);
    const { authors } = useSelector((state) => state.author);
    const { publishers } = useSelector((state) => state.publisher);
    // const { images: availableImages } = useSelector((state) => state.image); // KHÔNG CẦN NỮA

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        publisher: '',
        author: '',
        availability: 'true',
        stockCount: '',
        // images: [], // KHÔNG CẦN MẢNG ID NỮA, SẼ LÀ FILE OBJECTS
    });
    // State mới để lưu trữ các file ảnh được chọn
    const [selectedFiles, setSelectedFiles] = useState([]);
    // State để lưu trữ URL preview của ảnh
    const [imagePreviews, setImagePreviews] = useState([]);


    // Fetch dữ liệu cần thiết khi component mount
    useEffect(() => {
        dispatch(getAllCategories());
        dispatch(getAllAuthors());
        dispatch(getAllPublishers());
        // dispatch(getAllImages({ limit: 0 })); // KHÔNG CẦN NỮA
    }, [dispatch]);

    // Cleanup các URL đối tượng khi component unmount hoặc khi file thay đổi
    useEffect(() => {
        // Tạo URL preview khi selectedFiles thay đổi
        const newImagePreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(newImagePreviews);

        // Cleanup function để revoke Object URLs
        return () => {
            newImagePreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [selectedFiles]);

    // Xử lý thay đổi input form (trừ file input)
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
        }));
    };

    // Xử lý thay đổi file input
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Kiểm tra số lượng ảnh
        if (files.length > 5) {
            toast.error('Chỉ được chọn tối đa 5 ảnh. Vui lòng chọn lại.');
            e.target.value = ''; // Reset input
            return;
        }
        
        setSelectedFiles(files); // Lưu các file object
    };

    // Xóa một ảnh khỏi danh sách đã chọn
    const handleRemoveImage = (indexToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation cơ bản phía client
        if (!formData.title.trim() || !formData.description.trim() || formData.price === '' ||
            formData.stockCount === '' || !formData.category || !formData.publisher || !formData.author) {
            toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }
        if (selectedFiles.length === 0) {
            toast.error('Vui lòng tải lên ít nhất một ảnh cho sách.');
            return;
        }
        if (selectedFiles.length > 5) {
            toast.error('Chỉ được tải lên tối đa 5 ảnh cho sách.');
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
        selectedFiles.forEach((file) => {
            dataToSend.append('images', file); // 'images' là tên trường mà Multer mong đợi
        });

        try {
            await dispatch(addBook(dataToSend)).unwrap();
            toast.success('Thêm sách thành công!');
            navigate('/admin/books');
        } catch (err) {
            console.error('Add book failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaBook className="text-5xl" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-center leading-tight">Tạo Sách Mới</h1>
                    <p className="text-blue-100 text-center mt-2">Thêm thông tin chi tiết cho cuốn sách mới.</p>
                </div>
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Sách</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Tiêu đề sách ở một hàng riêng */}
                        <div>
                            <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                <FaBook className="mr-2 text-blue-600" /> Tiêu đề sách <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Nhập tiêu đề sách"
                                rows={2}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white transition duration-200 resize-y min-h-[60px]"
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        {/* Phần tải ảnh mới */}
                        <div className="mt-6 border-t pt-6 border-gray-200">
                            <label htmlFor="imageUpload" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                <FaImage className="mr-2 text-blue-600" /> Tải lên Ảnh sách <span className="text-red-500 ml-1">*</span> <span className="text-sm text-gray-500 ml-2">(Tối đa 5 ảnh)</span>
                            </label>
                            <input
                                id="imageUpload"
                                type="file"
                                name="images" // Tên trường này phải khớp với Multer trong backend
                                accept="image/*" // Chỉ chấp nhận các loại file ảnh
                                multiple // Cho phép chọn nhiều file
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {/* Preview các ảnh đã chọn từ máy tính */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4 p-3 border rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="relative w-full h-24 rounded-md overflow-hidden border border-gray-300 shadow-sm group">
                                            <img
                                                src={src}
                                                alt={`Preview ${index}`}
                                                className="object-cover w-full h-full"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/F3F4F6/9CA3AF?text=Error'; }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
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
                            {loading ? 'Đang tạo sách...' : 'Tạo Sách'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateBookPage;