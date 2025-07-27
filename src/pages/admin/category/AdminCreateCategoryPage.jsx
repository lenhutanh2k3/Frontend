// src/pages/admin/category/AdminCreateCategoryPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addCategory } from '../../../features/category/categorySlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaPlus, FaTags, FaAlignLeft } from 'react-icons/fa'; // Import icons

const AdminCreateCategoryPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.category);

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
            await dispatch(addCategory(formData)).unwrap();
            // toast.success đã được xử lý trong slice
            navigate('/admin/categories');
        } catch (err) {
            console.error('Create category failed:', err);
            // toast.error đã được xử lý trong slice
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title */}
                <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaTags className="text-5xl" /> {/* Icon cho Category */}
                    </div>
                    <h1 className="text-4xl font-extrabold text-center leading-tight">Thêm Danh mục mới</h1>
                    <p className="text-indigo-100 text-center mt-2">Điền thông tin chi tiết để thêm danh mục vào hệ thống.</p>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Danh mục'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateCategoryPage;
