// src/pages/admin/author/AdminCreateAuthorPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addAuthor } from '../../../features/author/authorSlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaPlus, FaPenFancy, FaBookOpen } from 'react-icons/fa'; // Import icons

const AdminCreateAuthorPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        biography: '',
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.author);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation cơ bản
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên tác giả.');
            return;
        }

        try {
            await dispatch(addAuthor(formData)).unwrap();
            // toast.success đã được xử lý trong slice
            navigate('/admin/authors');
        } catch (err) {
            console.error('Create author failed:', err);
            // toast.error đã được xử lý trong slice
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title */}
                <div className="md:w-1/3 bg-gradient-to-br from-purple-500 to-pink-600 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaPenFancy className="text-5xl" /> {/* Icon cho Author */}
                    </div>
                    <h1 className="text-4xl font-extrabold text-center leading-tight">Thêm Tác giả mới</h1>
                    <p className="text-purple-100 text-center mt-2">Điền thông tin chi tiết để thêm tác giả vào hệ thống.</p>
                </div>

                {/* Right Section - Form */}
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Tác giả</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                label="Tên Tác giả"
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nhập tên tác giả"
                                required
                                icon={FaPenFancy}
                            />
                        </div>
                        <div>
                            <Input
                                label="Tiểu sử"
                                id="biography"
                                type="text"
                                name="biography"
                                value={formData.biography}
                                onChange={handleChange}
                                placeholder="Nhập tiểu sử tác giả"
                                icon={FaBookOpen}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Tác giả'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateAuthorPage;
