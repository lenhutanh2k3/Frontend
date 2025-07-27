// src/pages/admin/category/AdminEditCategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategoryById, updateCategory, clearSelectedCategory } from '../../../features/category/categorySlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaEdit, FaTags, FaAlignLeft } from 'react-icons/fa'; // Import icons

const AdminEditCategoryPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedCategory, loading, error } = useSelector((state) => state.category);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        // Fetch category by ID khi component mount
        dispatch(getCategoryById(id));

        // Cleanup khi component unmounts hoặc id thay đổi
        return () => {
            dispatch(clearSelectedCategory());
        };
    }, [dispatch, id]);

    useEffect(() => {
        // Cập nhật formData khi selectedCategory thay đổi
        if (selectedCategory) {
            setFormData({
                name: selectedCategory.name || '',
                description: selectedCategory.description || '',
            });
        }
    }, [selectedCategory]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation cơ bản
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error('Vui lòng điền đầy đủ Tên và Mô tả danh mục.');
            return;
        }

        try {
            await dispatch(updateCategory({ id, categoryData: formData })).unwrap();
            // toast.success đã được xử lý trong slice
            navigate('/admin/categories');
        } catch (err) {
            console.error('Update category failed:', err);
            // toast.error đã được xử lý trong slice
        }
    };

    // Hiển thị trạng thái loading hoặc lỗi nếu chưa có dữ liệu
    if (loading && !selectedCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-blue-700 animate-pulse">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-semibold">Đang tải dữ liệu danh mục...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu không tải được category ban đầu
    if (error && !selectedCategory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="text-center text-red-700">
                    <h2 className="text-2xl font-bold mb-2">Lỗi!</h2>
                    <p>{error || "Không thể tải thông tin danh mục."}</p>
                    <Button onClick={() => navigate('/admin/categories')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Quay lại danh sách</Button>
                </div>
            </div>
        );
    }

    // Nếu không có selectedCategory sau khi loading xong, có thể là không tìm thấy
    if (!selectedCategory) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title */}
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaEdit className="text-5xl" /> {/* Icon cho Edit */}
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight">Chỉnh sửa Danh mục</h1>
                    <p className="text-blue-100 mt-2">Cập nhật thông tin chi tiết cho danh mục này.</p>
                </div>

                {/* Right Section - Form */}
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Danh mục</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                label="Tên Danh mục"
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nhập tên danh mục"
                                required
                                icon={FaTags}
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <FaAlignLeft className="mr-2" /> Mô tả
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Nhập mô tả danh mục"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập Nhật Danh mục'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditCategoryPage;
