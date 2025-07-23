// src/pages/admin/author/AdminEditAuthorPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthorById, updateAuthor, clearSelectedAuthor } from '../../../features/author/authorSlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaEdit, FaPenFancy, FaBookOpen } from 'react-icons/fa'; // Import icons

const AdminEditAuthorPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedAuthor, loading, error } = useSelector((state) => state.author);

    const [formData, setFormData] = useState({
        name: '',
        biography: '',
    });

    useEffect(() => {
        // Fetch author by ID khi component mount
        dispatch(getAuthorById(id));

        // Cleanup khi component unmounts hoặc id thay đổi
        return () => {
            dispatch(clearSelectedAuthor());
        };
    }, [dispatch, id]);

    useEffect(() => {
        // Cập nhật formData khi selectedAuthor thay đổi
        if (selectedAuthor) {
            setFormData({
                name: selectedAuthor.name || '',
                biography: selectedAuthor.biography || '',
            });
        }
    }, [selectedAuthor]);

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
            await dispatch(updateAuthor({ id, authorData: formData })).unwrap();
            // toast.success đã được xử lý trong slice
            navigate('/admin/authors');
        } catch (err) {
            console.error('Update author failed:', err);
            // toast.error đã được xử lý trong slice
        }
    };

    // Hiển thị trạng thái loading hoặc lỗi nếu chưa có dữ liệu
    if (loading && !selectedAuthor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-blue-700 animate-pulse">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-semibold">Đang tải dữ liệu tác giả...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi nếu không tải được author ban đầu
    if (error && !selectedAuthor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="text-center text-red-700">
                    <h2 className="text-2xl font-bold mb-2">Lỗi!</h2>
                    <p>{error || "Không thể tải thông tin tác giả."}</p>
                    <Button onClick={() => navigate('/admin/authors')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Quay lại danh sách</Button>
                </div>
            </div>
        );
    }

    // Nếu không có selectedAuthor sau khi loading xong, có thể là không tìm thấy
    if (!selectedAuthor) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title */}
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaEdit className="text-5xl" /> {/* Icon cho Edit */}
                    </div>
                    <h1 className="text-4xl font-extrabold leading-tight">Chỉnh sửa Tác giả</h1>
                    <p className="text-blue-100 mt-2">Cập nhật thông tin chi tiết cho tác giả này.</p>
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
                            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập Nhật Tác giả'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditAuthorPage;
