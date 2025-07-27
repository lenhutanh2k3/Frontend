import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { confirmChangePassword, resendChangePasswordOtp } from '../../features/auth/authSlice';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const VerifyChangePasswordOtpPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);

    const [otp, setOtp] = useState('');

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error('Vui lòng nhập mã OTP.');
            return;
        }
        if (!/^\d{6}$/.test(otp)) {
            toast.error('Mã OTP phải có 6 chữ số.');
            return;
        }
        try {
            await dispatch(confirmChangePassword(otp)).unwrap();
            setTimeout(async () => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // Lỗi đã được toast
        }
    };

    const handleResendOtp = async () => {
        try {
            await dispatch(resendChangePasswordOtp()).unwrap();
        } catch (err) {
            // Error toast đã được xử lý trong thunk
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Xác thực OTP để Đổi Mật Khẩu
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Mã OTP đã được gửi đến email <strong>{useSelector((state) => state.auth.changePasswordEmail)}</strong>. Vui lòng kiểm tra hộp thư đến (có thể cả thư rác/spam).
                </p>
                <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                    <Input
                        label="Mã OTP"
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Nhập mã OTP 6 chữ số"
                        maxLength={6}
                    />
                    <div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
                            disabled={loading}
                        >
                            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                        </Button>
                    </div>
                    <div className="text-center mb-2 w-full">
                        <Button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300"
                            onClick={handleResendOtp}
                            disabled={loading}
                        >
                            {loading ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                        </Button>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    <div className="text-center w-full">
                        <Link
                            to="/change-password"
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Trở lại trang đổi mật khẩu
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyChangePasswordOtpPage;