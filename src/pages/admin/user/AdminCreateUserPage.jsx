// src/pages/AdminCreateUserPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../../../features/user/userSlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone, FaImage, FaUserShield } from 'react-icons/fa'; // Import icons
import userService from '../../../services/userService';

const AdminCreateUserPage = () => {
    const [formData, setFormData] = useState({
        // Đã bỏ trường username
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        roleId: '', // Sẽ lưu ObjectId của role
        profilePicture: null,
    });
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [roles, setRoles] = useState([]); // State để lưu danh sách roles
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.user);

    useEffect(() => {
        // Fetch roles khi component mount
        const fetchRoles = async () => {
            try {
                const response = await userService.getRoles(); // Gọi API để lấy roles
                setRoles(response.data.roles);
                // Set roleId mặc định là 'user' nếu có trong danh sách
                const defaultUserRole = response.data.roles.find(r => r.roleName === 'user');
                if (defaultUserRole) {
                    setFormData(prev => ({ ...prev, roleId: defaultUserRole._id }));
                } else if (response.data.roles.length > 0) {
                    setFormData(prev => ({ ...prev, roleId: response.data.roles[0]._id }));
                }
            } catch (err) {
                toast.error("Không thể tải danh sách vai trò.");
                console.error("Fetch roles error:", err);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(file.type)) {
                toast.error('Vui lòng chọn file ảnh (JPEG, PNG, hoặc GIF).');
                setFormData((prev) => ({ ...prev, profilePicture: null }));
                setProfilePicturePreview(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Ảnh phải nhỏ hơn 5MB.');
                setFormData((prev) => ({ ...prev, profilePicture: null }));
                setProfilePicturePreview(null);
                return;
            }

            setFormData((prev) => ({ ...prev, profilePicture: file }));
            setProfilePicturePreview(URL.createObjectURL(file));
        } else {
            setFormData((prev) => ({ ...prev, profilePicture: null }));
            setProfilePicturePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (!formData.email || !formData.password || !formData.roleId) {
            toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }
        if (formData.password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        const formDataToSend = new FormData();
        // Append all fields to FormData
        for (const key in formData) {
            if (formData[key] !== null) { // Chỉ thêm các trường không null
                formDataToSend.append(key, formData[key]);
            }
        }

        try {
            await dispatch(createUser(formDataToSend)).unwrap(); // Gọi thunk createUser
            // toast.success đã được xử lý trong userSlice
            if (profilePicturePreview) URL.revokeObjectURL(profilePicturePreview);
            navigate('/admin/users'); // Điều hướng sau khi tạo thành công
        } catch (err) {
            console.error('Failed to create user:', err);
            // toast.error đã được xử lý trong userSlice
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title + Profile Picture */}
                <div className="md:w-1/3 bg-gradient-to-br from-green-500 to-emerald-600 p-8 flex flex-col items-center justify-center text-white text-center">
                    <div className="bg-white bg-opacity-20 rounded-full p-6 mb-4 transform transition-transform duration-300 hover:scale-105">
                        <FaUserPlus className="text-5xl" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-center leading-tight">Tạo Người Dùng Mới</h1>
                    <p className="text-green-100 text-center mt-2">Điền thông tin chi tiết để thêm người dùng mới vào hệ thống.</p>
                </div>

                {/* Right Section - Form */}
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Người dùng</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Đã bỏ trường username */}
                            {/* <div>
                                <Input
                                    label="Tên đăng nhập"
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    icon={FaUser}
                                />
                            </div> */}

                            <div>
                                <Input
                                    label="Email"
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email người dùng"
                                    required
                                    icon={FaEnvelope}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Mật khẩu"
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    icon={FaLock}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Họ và Tên"
                                    id="fullName"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên"
                                    icon={FaUser}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Số điện thoại"
                                    id="phoneNumber"
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                    icon={FaPhone}
                                />
                            </div>

                            <div>
                                <label htmlFor="roleId" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaUserShield className="mr-2 text-green-600" /> Vai trò <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="roleId"
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white appearance-none pr-10 transition duration-200"
                                        required
                                    >
                                        <option value="" disabled>Chọn vai trò</option>
                                        {roles.map(role => (
                                            <option key={role._id} value={role._id}>{role.roleName}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-6 border-gray-200">
                            <label htmlFor="profilePicture" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                <FaImage className="mr-2 text-green-600" /> Ảnh đại diện
                            </label>
                            <input
                                id="profilePicture"
                                type="file"
                                name="profilePicture"
                                onChange={handleFileChange}
                                className="w-full text-gray-700 bg-white border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer transition duration-200"
                                accept="image/*"
                            />
                            {profilePicturePreview && (
                                <div className="mt-4 flex justify-center">
                                    <img src={profilePicturePreview} alt="Profile Preview" className="w-32 h-32 object-cover rounded-full shadow-md border-2 border-green-400" />
                                </div>
                            )}
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Người Dùng Mới'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateUserPage;
