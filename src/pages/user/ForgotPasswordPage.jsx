// ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordRequest, setForgotPasswordEmail } from '../../features/auth/authSlice'; // Chỉ dùng forgotPasswordRequest và setForgotPasswordEmail
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  // const [isSubmitted, setIsSubmitted] = useState(false); // GỠ BỎ state này
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email của bạn');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    try {
      await dispatch(forgotPasswordRequest(email)).unwrap(); // Gọi thunk yêu cầu OTP
      dispatch(setForgotPasswordEmail(email)); // Lưu email vào Redux state để trang VerifyOtpPage có thể dùng
      navigate('/verify-otp'); // CHUYỂN HƯỚNG ĐẾN TRANG NHẬP OTP
    } catch (error) {
      console.error('Failed to send reset email:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quên Mật Khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Địa chỉ Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn"
          />
          <div>
            <Button
              type="submit"
              className="w-full bg-blue-600  text-white py-3 rounded-lg transition duration-300"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Đặt Lại Mật Khẩu'}
            </Button>
          </div>
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;