import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtpForForgotPassword, clearForgotPasswordEmail, forgotPasswordRequest } from '../../features/auth/authSlice';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const VerifyOtpPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Để nhận state từ trang ForgotPasswordPage
    const { loading, error } = useSelector((state) => state.auth);

    const [otp, setOtp] = useState('');
    const emailFromForgot = useSelector((state) => state.auth.forgotPasswordEmail); // Lấy email từ Redux state

    // Đảm bảo có email để xác thực OTP, nếu không thì quay lại ForgotPasswordPage
    useEffect(() => {
        if (!emailFromForgot) {
            toast.error("Vui lòng nhập email để đặt lại mật khẩu.");
            navigate('/forgot-password');
        }
    }, [emailFromForgot, navigate]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error('Vui lòng nhập mã OTP.');
            return;
        }
        if (!/^\d{6}$/.test(otp)) { // Validate OTP là 6 chữ số
            toast.error('Mã OTP phải có 6 chữ số.');
            return;
        }

        try {
            // Dispatch verifyOtpForForgotPassword với email và otp
            const passwordChangeToken = await dispatch(verifyOtpForForgotPassword({ email: emailFromForgot, otp })).unwrap();
            // Chuyển hướng đến trang đặt lại mật khẩu và truyền passwordChangeToken
            navigate('/reset-password-confirm', { state: { passwordChangeToken: passwordChangeToken, email: emailFromForgot } }); // TRUYỀN TOKEN VÀ EMAIL
        } catch (err) {
            console.error('OTP verification failed:', err);
            // Lỗi đã được toast bởi thunk
        }
    };

    const handleResendOtp = async () => {
        if (!emailFromForgot) {
            toast.error('Không tìm thấy email để gửi lại mã OTP.');
            return;
        }
        try {
            await dispatch(forgotPasswordRequest(emailFromForgot)).unwrap();
            toast.success('Đã gửi lại mã OTP thành công!');
        } catch (err) {
            toast.error('Gửi lại mã OTP thất bại.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Xác thực OTP
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Mã OTP đã được gửi đến email <strong>{emailFromForgot}</strong>. Vui lòng kiểm tra hộp thư đến (có thể cả thư rác/spam).
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
                            className="w-full bg-blue-600  text-white py-3 rounded-lg transition duration-300"
                            disabled={loading}
                        >
                            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                        </Button>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    <div className="text-center mt-4">
                        <Button
                            type="button"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-300 mt-2"
                            onClick={handleResendOtp}
                            disabled={loading}
                        >
                            Gửi lại mã OTP
                        </Button>
                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-700 hover:text-blue-700 block mt-2"
                            onClick={() => dispatch(clearForgotPasswordEmail())}
                        >
                            Nhập lại email khác
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtpPage;