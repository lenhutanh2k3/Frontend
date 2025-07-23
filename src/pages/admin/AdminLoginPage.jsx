// src/pages/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../features/auth/authSlice'; // Import logout
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FaLock, FaUser } from 'react-icons/fa'; // Import icons

const AdminLoginPage = () => {
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error, loading } = useSelector((state) => state.auth); // Không cần isAdminAuthenticated ở đây

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resultAction = await dispatch(login(credentials)).unwrap(); // Sử dụng login thunk

            // Kiểm tra vai trò của người dùng sau khi đăng nhập thành công
            // resultAction.user sẽ có dạng { ..., role: { id: '...', name: 'admin' } }
            if (resultAction.user && resultAction.user.role && resultAction.user.role.name === 'admin') {
                navigate('/admin'); // Điều hướng đến trang admin dashboard
            } else {
                // Nếu không phải admin, hiển thị lỗi và đăng xuất ngay lập tức
                await dispatch(logout()); // Đăng xuất người dùng nếu không có quyền admin
                toast.error('Tài khoản của bạn không có quyền truy cập quản trị.');
                navigate('/login'); // Điều hướng về trang đăng nhập chung
            }
        } catch (err) {
            console.error('Admin login failed:', err);
            // Lỗi đã được xử lý và hiển thị toast ở authSlice.js
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in-down">
                <div className="text-center mb-8">
                    <div className="mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-lg">
                        <FaLock className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Admin Login</h1>
                    <p className="text-gray-600 mt-2 text-md">Đăng nhập để truy cập bảng điều khiển quản trị</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                            <FaUser className="mr-2 text-blue-500" /> Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            placeholder="Nhập email quản trị"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                            <FaLock className="mr-2 text-blue-500" /> Mật khẩu
                        </label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng Nhập Quản Trị'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;