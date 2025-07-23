// src/pages/admin/publisher/AdminCreatePublisherPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addPublisher } from '../../../features/publisher/publisherSlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaPlus, FaBuilding, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const AdminCreatePublisherPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.publisher);


    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Xóa lỗi khi người dùng bắt đầu nhập
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Hàm kiểm tra định dạng email hoặc số điện thoại
    const validateContact = (contact) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/; // Ví dụ: 0912345678 hoặc +84912345678

        return emailRegex.test(contact) || phoneRegex.test(contact);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation cơ bản
        let isValid = true;
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên Nhà xuất bản không được để trống.';
            isValid = false;
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Địa chỉ không được để trống.';
            isValid = false;
        }
        if (!formData.contact.trim()) {
            newErrors.contact = 'Thông tin liên hệ không được để trống.';
            isValid = false;
        } else if (!validateContact(formData.contact.trim())) {
            newErrors.contact = 'Thông tin liên hệ phải là email hoặc số điện thoại hợp lệ.';
            isValid = false;
        }

        setFieldErrors(newErrors); // Cập nhật state lỗi để hiển thị

        if (!isValid) {
            toast.error('Vui lòng điền đầy đủ và đúng định dạng các trường thông tin.');
            return;
        }

        try {
            await dispatch(addPublisher(formData)).unwrap();
            // toast.success đã được xử lý trong slice
            navigate('/admin/publishers');
        } catch (err) {
            console.error('Create publisher failed:', err);
            // toast.error đã được xử lý trong slice
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title */}
                <div className="md:w-1/3 bg-gradient-to-br from-green-500 to-emerald-600 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaBuilding className="text-5xl" /> {/* Icon cho Publisher */}
                    </div>
                    <h1 className="text-4xl font-extrabold text-center leading-tight">Thêm Nhà xuất bản mới</h1>
                    <p className="text-green-100 text-center mt-2">Điền thông tin chi tiết để thêm nhà xuất bản vào hệ thống.</p>
                </div>

                {/* Right Section - Form */}
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Nhà xuất bản</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                label="Tên Nhà xuất bản"
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Nhập tên nhà xuất bản"
                                required
                                icon={FaBuilding}
                                error={fieldErrors.name} // Truyền lỗi cho component Input
                            />
                        </div>
                        <div>
                            <Input
                                label="Địa chỉ"
                                id="address"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ"
                                required
                                icon={FaMapMarkerAlt}
                                error={fieldErrors.address} // Truyền lỗi cho component Input
                            />
                        </div>
                        <div>
                            <Input
                                label="Liên hệ"
                                id="contact"
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                                placeholder="Nhập email hoặc số điện thoại (ví dụ: email@example.com hoặc 0912345678)"
                                required
                                icon={validateContact(formData.contact.trim()) ? (formData.contact.includes('@') ? FaEnvelope : FaPhoneAlt) : FaPhoneAlt} // Hiển thị icon động
                                error={fieldErrors.contact}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Nhà xuất bản'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreatePublisherPage;