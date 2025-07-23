// src/pages/admin/publisher/AdminEditPublisherPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getPublisherById, updatePublisher, clearSelectedPublisher } from '../../../features/publisher/publisherSlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaEdit, FaBuilding, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'; // Import icons

const AdminEditPublisherPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedPublisher, loading, error } = useSelector((state) => state.publisher);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
    });
    // const [formErrors, setFormErrors] = useState({}); // Loại bỏ formErrors cục bộ

    useEffect(() => {
        // Fetch publisher by ID khi component mount
        dispatch(getPublisherById(id));

        // Cleanup khi component unmounts hoặc id thay đổi
        return () => {
            dispatch(clearSelectedPublisher());
        };
    }, [dispatch, id]); // Phụ thuộc vào dispatch và id

    useEffect(() => {
        // Cập nhật formData khi selectedPublisher thay đổi
        if (selectedPublisher) {
            setFormData({
                name: selectedPublisher.name || '',
                address: selectedPublisher.address || '',
                contact: selectedPublisher.contact || '',
            });
        }
    }, [selectedPublisher]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation cơ bản
        if (!formData.name.trim() || !formData.address.trim() || !formData.contact.trim()) {
            toast.error('Vui lòng điền đầy đủ tất cả các trường.');
            return;
        }

        try {
            await dispatch(updatePublisher({ id, publisherData: formData })).unwrap();
            // toast.success đã được xử lý trong slice
            navigate('/admin/publishers');
        } catch (err) {
            console.error('Update publisher failed:', err);
            // toast.error đã được xử lý trong slice
        }
    };

    // Hiển thị trạng thái loading hoặc lỗi nếu chưa có dữ liệu
    if (loading && !selectedPublisher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-blue-700 animate-pulse">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-semibold">Đang tải dữ liệu nhà xuất bản...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu không tải được publisher ban đầu
    if (error && !selectedPublisher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="text-center text-red-700">
                    <h2 className="text-2xl font-bold mb-2">Lỗi!</h2>
                    <p>{error || "Không thể tải thông tin nhà xuất bản."}</p>
                    <Button onClick={() => navigate('/admin/publishers')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Quay lại danh sách</Button>
                </div>
            </div>
        );
    }

    // Nếu không có selectedPublisher sau khi loading xong, có thể là không tìm thấy
    if (!selectedPublisher) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title */}
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaEdit className="text-5xl" /> {/* Icon cho Edit */}
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight">Chỉnh sửa Nhà xuất bản</h1>
                    <p className="text-blue-100 mt-2">Cập nhật thông tin chi tiết cho nhà xuất bản này.</p>
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
                                placeholder="Nhập thông tin liên hệ (email/điện thoại)"
                                required
                                icon={FaPhoneAlt}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập Nhật Nhà xuất bản'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditPublisherPage;
