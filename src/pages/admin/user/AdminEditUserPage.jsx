// src/pages/AdminEditUserPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, updateUser, clearSelectedUser } from '../../../features/user/userSlice';
import { toast } from 'react-toastify';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { FaUser, FaEnvelope, FaPhone, FaUserShield, FaImage, FaToggleOn, FaTrashAlt } from 'react-icons/fa'; // Import icons
import userService from '../../../services/userService'; // Import userService để lấy roles

const AdminEditUserPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedUser, loading, error } = useSelector((state) => state.user);
    const baseUrl = import.meta.env.VITE_USER_SERVICE || '';

    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phoneNumber: '',
        roleId: '', // Sẽ lưu ObjectId của role
        profilePicture: null, // Dùng cho file mới
        isActive: true, // Thêm trạng thái isActive
        isDeleted: false, // Thêm trạng thái isDeleted
    });

    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [roles, setRoles] = useState([]); // State để lưu danh sách roles

    useEffect(() => {
        dispatch(getUser(id)); // Lấy thông tin user cần chỉnh sửa
        const fetchRoles = async () => {
            try {
                const response = await userService.getRoles();
                setRoles(response.data.roles);
            } catch (err) {
                toast.error("Không thể tải danh sách vai trò.");
                console.error("Fetch roles error:", err);
            }
        };
        fetchRoles();

        return () => {
            dispatch(clearSelectedUser());
            if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
                URL.revokeObjectURL(profilePicturePreview);
            }
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                email: selectedUser.email || '',
                fullName: selectedUser.fullName || '',
                phoneNumber: selectedUser.phoneNumber || '',
                roleId: selectedUser.role ? selectedUser.role.id : '', // Lấy ID của role
                profilePicture: null, // Reset file input
                isActive: selectedUser.isActive,
                isDeleted: selectedUser.isDeleted,
            });

            if (selectedUser.profilePicture) {
                const fullImageUrl = selectedUser.profilePicture.startsWith('http')
                    ? selectedUser.profilePicture
                    : `${baseUrl}${selectedUser.profilePicture}`;
                setProfilePicturePreview(fullImageUrl);
            } else {
                setProfilePicturePreview(null);
            }
        }
    }, [selectedUser, baseUrl]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validImageTypes.includes(file.type)) {
                toast.error('Vui lòng chọn file ảnh (JPEG, PNG, hoặc GIF).');
                setFormData((prev) => ({ ...prev, profilePicture: null }));
                setProfilePicturePreview(selectedUser?.profilePicture ? `${baseUrl}${selectedUser.profilePicture}` : null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Ảnh phải nhỏ hơn 5MB.');
                setFormData((prev) => ({ ...prev, profilePicture: null }));
                setProfilePicturePreview(selectedUser?.profilePicture ? `${baseUrl}${selectedUser.profilePicture}` : null);
                return;
            }

            setFormData((prev) => ({ ...prev, profilePicture: file }));
            setProfilePicturePreview(URL.createObjectURL(file));
        } else {
            setFormData((prev) => ({ ...prev, profilePicture: null }));
            setProfilePicturePreview(selectedUser?.profilePicture
                ? `${baseUrl}${selectedUser.profilePicture}`
                : null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        // Append only fields that have changed or are required
        for (const key in formData) {
            // Không gửi profilePicture nếu là null (không chọn ảnh mới)
            if (key === 'profilePicture' && formData[key] === null) {
                continue;
            }
            // Chuyển đổi boolean sang string để FormData xử lý đúng
            if (typeof formData[key] === 'boolean') {
                formDataToSend.append(key, formData[key] ? 'true' : 'false');
            } else if (formData[key] !== undefined && formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        }

        try {
            await dispatch(updateUser({ id, data: formDataToSend })).unwrap();
            // toast.success đã được xử lý trong userSlice
            if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
                URL.revokeObjectURL(profilePicturePreview);
            }
            navigate('/admin/users');
        } catch (err) {
            console.error("Update user error:", err);
            // toast.error đã được xử lý trong userSlice
        }
    };

    if (loading && !selectedUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center text-blue-700 animate-pulse">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-semibold">Đang tải dữ liệu người dùng...</p>
                </div>
            </div>
        );
    }

    if (error && !selectedUser) { // Hiển thị lỗi nếu không tải được user ban đầu
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="text-center text-red-700">
                    <h2 className="text-2xl font-bold mb-2">Lỗi!</h2>
                    <p>{error || "Không thể tải thông tin người dùng."}</p>
                    <Button onClick={() => navigate('/admin/users')} className="mt-4 bg-red-600 hover:bg-red-700 text-white">Quay lại danh sách</Button>
                </div>
            </div>
        );
    }

    if (!selectedUser) return null; // Tránh render khi selectedUser là null sau khi loading

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden md:flex transform transition-transform duration-300 hover:scale-[1.01] animate-fade-in">
                {/* Left Section - Icon & Title + Profile Picture */}
                <div className="md:w-1/3 bg-gradient-to-br from-blue-500 to-blue-700 p-8 flex flex-col items-center justify-center text-white text-center">
                    {/* Profile Picture Display */}
                    <div className="mb-6">
                        {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Profile Preview" className="w-32 h-32 object-cover rounded-full shadow-md border-4 border-blue-300 mx-auto" />
                        ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm border-4 border-blue-300 shadow-md mx-auto">
                                Không có ảnh
                            </div>
                        )}
                    </div>
                    {/* File Input and name for new selection */}
                    <div className="w-full mb-4">
                        <label
                            htmlFor="profilePicture"
                            className="cursor-pointer bg-blue-400 text-white py-2 px-6 rounded-full font-semibold hover:bg-blue-500 transition duration-300 ease-in-out shadow-md hover:shadow-lg inline-block w-auto"
                        >
                            <span className="text-sm">Chọn ảnh mới</span>
                            <input
                                id="profilePicture"
                                type="file"
                                name="profilePicture"
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </label>
                        {formData.profilePicture && (
                            <p className="text-xs text-blue-100 mt-2 italic break-all">Đã chọn: {formData.profilePicture.name}</p>
                        )}
                    </div>

                    {/* Title and Description */}
                    <h1 className="text-4xl font-extrabold leading-tight mt-6">Chỉnh Sửa Người Dùng</h1>
                    <p className="text-blue-100 mt-2">Cập nhật thông tin chi tiết cho tài khoản người dùng.</p>
                </div>

                {/* Right Section - Form */}
                <div className="md:w-2/3 p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Thông tin Người dùng</h2>
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    disabled // Không cho sửa email, hiển thị mờ
                                    className="bg-gray-100 cursor-not-allowed"
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
                                    required // Họ tên không rỗng
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
                                    required // Số điện thoại đúng 10 số, bắt đầu bằng 0
                                    pattern="^0\d{9}$"
                                    title="Số điện thoại phải là 10 số, bắt đầu bằng 0 (ví dụ: 0123456789)"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="roleId" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaUserShield className="mr-2 text-blue-600" /> Vai trò <span className="text-red-500 ml-1">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="roleId"
                                        name="roleId"
                                        value={formData.roleId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white appearance-none pr-10 transition duration-200"
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

                        {/* Thêm các toggle isActive và isDeleted */}
                        <div className="mt-6 border-t pt-6 border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="isActive" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaToggleOn className="mr-2 text-blue-600" /> Trạng thái kích hoạt
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        id="isActive"
                                        type="checkbox"
                                        name="isActive"
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        {formData.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                                    </span>
                                </label>
                            </div>
                            <div>
                                <label htmlFor="isDeleted" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center">
                                    <FaTrashAlt className="mr-2 text-red-600" /> Trạng thái xóa mềm
                                </label>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        id="isDeleted"
                                        type="checkbox"
                                        name="isDeleted"
                                        className="sr-only peer"
                                        checked={formData.isDeleted}
                                        onChange={handleChange}
                                    />
                                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                                        {formData.isDeleted ? 'Đã xóa' : 'Chưa xóa'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập Nhật Người Dùng'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditUserPage;