import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    getUsers,
    softDeleteUser,
    restoreUser,
    toggleUserActiveStatus,
} from '../../../features/user/userSlice';
import Button from '../../../components/common/Button';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaUserPlus, FaRedo, FaFilter } from 'react-icons/fa';

const AdminUsersPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { users, loading, error, pagination } = useSelector((state) => state.user);
    const currentUser = useSelector((state) => state.auth.user);

    const [currentPage, setCurrentPage] = useState(1);
    const limit = 5;
    const [filterByStatus, setFilterByStatus] = useState('all_non_deleted');

    useEffect(() => {
        let backendFilterParam = '';
        if (filterByStatus === 'all_non_deleted') {
            backendFilterParam = '';
        } else if (filterByStatus === 'all') {
            backendFilterParam = 'all';
        } else {
            backendFilterParam = filterByStatus;
        }

        dispatch(getUsers({ filterBy: backendFilterParam, page: currentPage, limit }));
    }, [dispatch, filterByStatus, currentPage]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const getRoleLabel = (roleName) => {
        if (roleName?.toLowerCase() === 'admin') {
            return { label: 'Admin', className: 'bg-red-100 text-red-800' };
        }
        return { label: 'User', className: 'bg-blue-100 text-blue-800' };
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser._id) {
            toast.warning("Bạn không thể xóa chính mình.");
            return;
        }
        if (window.confirm('Bạn có chắc chắn muốn xóa mềm người dùng này không?')) {
            try {
                await dispatch(softDeleteUser(userId)).unwrap();
                dispatch(getUsers({ filterBy: filterByStatus, page: currentPage, limit }));
            } catch (err) {
                toast.error(err || 'Không thể xóa người dùng.');
            }
        }
    };

    const handleRestoreUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn khôi phục người dùng này không?')) {
            try {
                await dispatch(restoreUser(userId)).unwrap();
                toast.success('Khôi phục người dùng thành công!');
                dispatch(getUsers({ filterBy: filterByStatus, page: currentPage, limit }));
            } catch (err) {
                toast.error(err || 'Không thể khôi phục người dùng.');
            }
        }
    };

    const handleToggleActivate = async (userId, currentIsActive) => {
        if (userId === currentUser._id) {
            toast.warning("Bạn không thể tự vô hiệu hóa chính mình.");
            return;
        }
        const action = currentIsActive ? 'vô hiệu hóa' : 'kích hoạt';
        if (window.confirm(`Bạn có chắc chắn muốn ${action} người dùng này không?`)) {
            try {
                await dispatch(toggleUserActiveStatus({ id: userId, isActive: !currentIsActive })).unwrap();
                toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thành công!`);
                dispatch(getUsers({ filterBy: filterByStatus, page: currentPage, limit }));
            } catch (err) {
                toast.error(err || `Không thể ${action} người dùng.`);
            }
        }
    };

    const handleEditUser = (userId) => {
        if (userId === currentUser._id) {
            toast.warning("Bạn không thể chỉnh sửa chính mình tại đây.");
            return;
        }
        navigate(`/admin/users/edit/${userId}`);
    };

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Quản lý Người Dùng</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative inline-block text-gray-700">
                        <select
                            value={filterByStatus}
                            onChange={(e) => setFilterByStatus(e.target.value)}
                            className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-full shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                        >
                            <option value="all_non_deleted">Tất cả (Hoạt động / Vô hiệu hóa)</option>
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Bị vô hiệu hóa</option>
                            <option value="deleted">Đã xóa mềm</option>
                            <option value="all">Tất cả người dùng (bao gồm đã xóa)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <FaFilter className="text-lg" />
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate('/admin/users/create')}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full transition duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <FaUserPlus className="mr-2" /> Thêm người dùng
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl text-gray-600 animate-pulse">Đang tải danh sách người dùng...</p>
                </div>
            ) : users.length === 0 ? (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-600 flex items-center">
                        <FaTimes className="mr-2 text-red-500" /> Không tìm thấy người dùng nào.
                    </p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">STT</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ảnh</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên & Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vai trò</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {users.map((user, index) => {
                                        const roleInfo = getRoleLabel(user.role?.roleName);
                                        return (
                                            <tr key={user._id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                                                    {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                                        src={user.profilePicture ? `${import.meta.env.VITE_USER_SERVICE || ''}${user.profilePicture}` : 'https://via.placeholder.com/40/F3F4F6/9CA3AF?text=User'}
                                                        alt={user.fullName || user.email}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{user.fullName || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${roleInfo.className}`}>
                                                        {roleInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isDeleted
                                                        ? 'bg-gray-200 text-gray-800'
                                                        : user.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.isDeleted ? 'Đã xóa' : user.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center items-center space-x-3">
                                                        {user.isDeleted ? (
                                                            <button
                                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition duration-150"
                                                                onClick={() => handleRestoreUser(user._id)}
                                                                title="Khôi phục người dùng"
                                                            >
                                                                <FaRedo className="text-lg" />
                                                            </button>
                                                        ) : (
                                                            user._id !== currentUser._id ? (
                                                                <>
                                                                    <button
                                                                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition duration-150"
                                                                        onClick={() => handleEditUser(user._id)}
                                                                        title="Chỉnh sửa người dùng"
                                                                    >
                                                                        <FaEdit className="text-lg" />
                                                                    </button>
                                                                    <button
                                                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-150"
                                                                        onClick={() => handleDeleteUser(user._id)}
                                                                        title="Xóa mềm người dùng"
                                                                    >
                                                                        <FaTrash className="text-lg" />
                                                                    </button>
                                                                    <button
                                                                        className={`${user.isActive ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800'} p-2 rounded-full hover:bg-yellow-100 transition duration-150`}
                                                                        onClick={() => handleToggleActivate(user._id, user.isActive)}
                                                                        title={user.isActive ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
                                                                    >
                                                                        {user.isActive ? <FaTimes className="text-lg" /> : <FaCheck className="text-lg" />}
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <span className="text-xs text-gray-500 italic">Tài khoản đang đăng nhập</span>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pagination && pagination.totalPages > 0 && (
                        <div className="mt-8 flex justify-center items-center space-x-3">
                            {/* Nút Previous */}
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Trước
                            </button>
                            
                            {/* Hiển thị số trang */}
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((number) => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`px-4 py-2 rounded-full font-semibold transition duration-300 ${pagination.currentPage === number ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {number}
                                </button>
                            ))}
                            
                            {/* Nút Next */}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4 py-2 rounded-full font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 flex items-center"
                            >
                                Sau
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminUsersPage;
