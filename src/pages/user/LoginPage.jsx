import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaGoogle } from 'react-icons/fa';
import { login, clearError } from '../../features/auth/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user, accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear lỗi khi vào trang login
    dispatch(clearError());
    localStorage.removeItem('authError');
    sessionStorage.removeItem('authError');
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      await dispatch(login(formData)).unwrap();
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-10 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <div className="bg-white p-5 md:pl-8 rounded-2xl shadow-2xl w-full max-w-s sm:max-w-xl md:max-w-md lg:max-w-sm transform transition-all duration-500 hover:shadow-3xl hover:-translate-y-2">

        <div className="flex justify-around mb-2 md:mb-4 border-b border-gray-200 md:border-gray-300">
          <Link
            to="/login"
            className="py-2 md:py-3 px-2 md:px-4 text-blue-600 font-bold text-base md:text-lg relative group transition duration-300"
          >
            Đăng nhập
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-100 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Link>
          <Link
            to="/register"
            className="py-2 md:py-3 px-2 md:px-4 text-gray-600 font-medium text-base md:text-lg relative group transition duration-300 hover:text-blue-600"
          >
            Đăng ký
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              required
              error={errors.email}
              showPasswordToggle={false}
              className="py-2 md:py-2 px-3 md:px-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm md:text-base"
            />
          </div>

          <div>
            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu của bạn"
              required
              error={errors.password}
              showPasswordToggle={true}
              className="py-2 md:py-2 px-3 md:px-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm md:text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full py-2 md:py-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg text-base"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <p className="text-center text-sm mt-2 md:mt-3">
            <Link to="/forgot-password" className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200">
              Quên mật khẩu?
            </Link>
          </p>
        </form>

        <p className="text-center text-gray-600 text-sm mt-3 md:mt-4">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;