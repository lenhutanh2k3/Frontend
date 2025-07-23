
import React, { useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { requestChangePasswordOtp } from '../../features/auth/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import NavbarUser from '../../components/common/NavbarUser';

const ChangePasswordPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth); // Bỏ user

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [errors, setErrors] = useState({});

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    const validateForm = () => {
        const newErrors = {};
        if (!currentPassword) {
            newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.';
        }
        if (!newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
        } else if (!/[A-Z]/.test(newPassword)) {
            newErrors.newPassword = 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa.';
        }
        if (!confirmNewPassword) {
            newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới.';
        } else if (newPassword !== confirmNewPassword) {
            newErrors.confirmNewPassword = 'Xác nhận mật khẩu mới không khớp.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Vui lòng nhập đầy đủ thông tin và đúng định dạng.');
            return;
        }
        try {
            await dispatch(requestChangePasswordOtp({ currentPassword, newPassword, confirmNewPassword })).unwrap();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            navigate('/verify-change-password-otp');
        } catch (err) {
            // Lỗi đã được toast
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 py-8">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    <NavbarUser />
                    <div className="lg:w-3/4 bg-white p-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
                        <h1 className="text-3xl font-bold mb-6 border-b-2 border-blue-600 pb-2">
                            Đổi Mật Khẩu
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Để đổi mật khẩu, bạn cần xác thực bằng email và sau đó cung cấp mật khẩu hiện tại.
                        </p>

                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            
                            <Input
                                label="Mật khẩu hiện tại"
                                name="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full p-3 border rounded-lg border-gray-300"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                            {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                            <Input
                                label="Mật khẩu mới"
                                name="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full p-3 border rounded-lg border-gray-300"
                                placeholder="Nhập mật khẩu mới"
                            />
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                            <Input
                                label="Xác nhận mật khẩu mới"
                                name="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                className="w-full p-3 border rounded-lg border-gray-300"
                                placeholder="Xác nhận mật khẩu mới"
                            />
                            {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>}
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg transition duration-300"
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi yêu cầu...' : 'Gửi mã xác thực'}
                            </Button>
                            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;