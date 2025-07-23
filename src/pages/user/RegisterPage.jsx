import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input'; // Đã chỉnh sửa Input
import Button from '../../components/common/Button'; // Đã chỉnh sửa Button
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    repeat_password: '',
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear lỗi khi vào trang đăng ký
    dispatch(clearError());
    localStorage.removeItem('authError');
    sessionStorage.removeItem('authError');
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa';
    }

    if (!formData.repeat_password) {
      newErrors.repeat_password = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.repeat_password) {
      newErrors.repeat_password = 'Mật khẩu và xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(register(formData)).unwrap();
      setTimeout(() => {
        navigate('/login');
      }, 500);
      setFormData({
        email: '',
        password: '',
        repeat_password: '',
      });
      setErrors({});
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mt-10 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-fade-in-scale">

        <div className="flex justify-around mb-4 md:mb-6 border-b border-gray-200">
          <Link
            to="/login"
            className="py-2 md:py-3 px-2 md:px-4 text-gray-600 font-medium text-base md:text-lg relative group transition duration-300 hover:text-blue-600"
          >
            Đăng nhập
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 transform origin-bottom-left"></span>
          </Link>
          <Link
            to="/register"
            className="py-2 md:py-3 px-2 md:px-4 text-blue-600 font-bold text-base md:text-lg relative group transition duration-300"
          >
            Đăng ký
            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 scale-x-100 group-hover:scale-x-100 transition-transform duration-300 transform origin-bottom-left"></span>
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
              className="py-2 md:py-2 px-3 md:px-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm md:text-base"
            />
          </div>

          <div>
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              name="repeat_password"
              value={formData.repeat_password}
              onChange={handleChange}
              placeholder="Xác nhận mật khẩu của bạn"
              required
              error={errors.repeat_password}
              className="py-2 md:py-2 px-3 md:px-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600 text-sm md:text-base"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <Button
            type="submit"
            className="w-full py-2 md:py-2 shadow-md hover:shadow-lg text-base"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-3 md:mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline hover:text-blue-800 transition duration-200">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;