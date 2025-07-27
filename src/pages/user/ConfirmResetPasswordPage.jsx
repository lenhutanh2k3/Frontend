// src/pages/ConfirmResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword, clearForgotPasswordEmail, logout } from '../../features/auth/authSlice';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ConfirmResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const passwordChangeToken = location.state?.passwordChangeToken;
  const emailFromVerify = location.state?.email;

  useEffect(() => {
    if (!passwordChangeToken || !emailFromVerify) {
      toast.error("Thiếu thông tin để đặt lại mật khẩu. Vui lòng bắt đầu lại quy trình.");
      navigate('/forgot-password');
    }
  }, [passwordChangeToken, emailFromVerify, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      toast.error('Vui lòng nhập mật khẩu mới và xác nhận.');
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
    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error('Mật khẩu mới phải chứa ít nhất 1 chữ số.');
      return;
    }
    console.log({
      email: emailFromVerify,
      passwordChangeToken,
      newPassword,
      confirmNewPassword,
    });
    try {
      await dispatch(resetPassword({
        email: emailFromVerify,
        passwordChangeToken,
        newPassword,
        confirmNewPassword,
      })).unwrap();
      dispatch(clearForgotPasswordEmail());
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đặt Lại Mật Khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập mật khẩu mới của bạn cho tài khoản <strong>{emailFromVerify}</strong>.
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
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
          <div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300"
              disabled={loading}
            >
              {loading ? 'Đang đặt lại...' : 'Đặt Lại Mật Khẩu'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => dispatch(clearForgotPasswordEmail())}
            >
              Bắt đầu lại quy trình quên mật khẩu
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmResetPasswordPage;