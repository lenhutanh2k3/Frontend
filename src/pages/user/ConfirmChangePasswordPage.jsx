// src/pages/ConfirmChangePasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { confirmChangePassword, logout } from '../../features/auth/authSlice';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ConfirmChangePasswordPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error } = useSelector((state) => state.auth);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const passwordChangeToken = location.state?.passwordChangeToken;
    const emailFromVerify = location.state?.email;

    useEffect(() => {
        if (!passwordChangeToken || !emailFromVerify) {
            toast.error("Thiếu thông tin để đặt lại mật khẩu. Vui lòng bắt đầu lại quy trình.");
            navigate('/change-password');
        }
    }, [passwordChangeToken, emailFromVerify, navigate]);

    const handleConfirmChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            toast.error('Vui lòng điền đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu.');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            toast.error('Mật khẩu mới phải chứa ít nhất 1 chữ hoa.');
            return;
        }
        if (newPassword === currentPassword) {
            toast.error('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        try {
            await dispatch(confirmChangePassword({
                passwordChangeToken,
                currentPassword,
                newPassword,
            })).unwrap();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => {
                const isAdmin = window.location.pathname.includes('/admin');
                navigate(isAdmin ? '/admin/login' : '/login');
            }, 2000);
        } catch (err) {
            console.error('Confirm change password error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Đặt Mật Khẩu Mới
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn cho tài khoản <strong>{emailFromVerify}</strong>.
                </p>
                <form className="mt-8 space-y-6" onSubmit={handleConfirmChangePassword}>
                    <div>
                        <Input
                            label="Mật khẩu hiện tại"
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Nhập mật khẩu hiện tại của bạn"
                        />
                    </div>
                    <div>
                        <Input
                            label="Mật khẩu mới"
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <Input
                            label="Xác nhận mật khẩu mới"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            type="password"
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Xác nhận mật khẩu mới"
                            minLength={6}
                        />
                    </div>
                    <div>
                        <Button
                            type="submit"
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition duration-300"
                            disabled={loading}
                        >
                            {loading ? 'Đang đổi mật khẩu...' : 'Đổi Mật Khẩu'}
                        </Button>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    <div className="text-center mt-4">
                        <Link
                            to="/change-password"
                            className="text-sm text-orange-600 hover:text-orange-800"
                        >
                            Bắt đầu lại quy trình đổi mật khẩu
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfirmChangePasswordPage;