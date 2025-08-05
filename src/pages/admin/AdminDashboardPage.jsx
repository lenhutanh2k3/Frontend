import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUsers } from '../../features/user/userSlice';
import { getAllCategories } from '../../features/category/categorySlice';
import { getAllBooks } from '../../features/book/bookSlice';
import { getAllAuthors } from '../../features/author/authorSlice';
import { getAllPublishers } from '../../features/publisher/publisherSlice';
import { getAllOrders } from '../../features/order/orderSlice';
import { getAllReviews } from '../../features/review/reviewSlice';
import { FaUsers, FaTags, FaBook, FaUserEdit, FaBuilding, FaShoppingCart, FaMoneyBillWave, FaTrash, FaUserTimes, FaStar } from 'react-icons/fa';
import userService from '../../services/userService';

const AdminDashboardPage = () => {
    const dispatch = useDispatch();
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [deletedUsersCount, setDeletedUsersCount] = useState(0);
    const [deletedUsersLoading, setDeletedUsersLoading] = useState(false);
    
    const {
        users, loading: userLoading, error: userError, pagination: userPagination
    } = useSelector((state) => state.user);
    const {
        categories, loading: categoryLoading, error: categoryError, pagination: categoryPagination
    } = useSelector((state) => state.category);
    const {
        books, loading: bookLoading, error: bookError, pagination: bookPagination
    } = useSelector((state) => state.book);
    const {
        authors, loading: authorLoading, error: authorError, pagination: authorPagination
    } = useSelector((state) => state.author);
    const {
        publishers, loading: publisherLoading, error: publisherError, pagination: publisherPagination
    } = useSelector((state) => state.publisher);
    const {
        orders, loading: orderLoading, error: orderError, pagination: orderPagination
    } = useSelector((state) => state.order);
    const {
        adminReviews, loading: reviewLoading, error: reviewError, pagination: reviewPagination
    } = useSelector((state) => state.review);

    useEffect(() => {
        // Gọi API để lấy tổng số bản ghi (không cần phân trang, chỉ lấy totalItems)
        dispatch(getUsers({ page: 1, limit: 1, getTotal: true }));
        dispatch(getAllCategories({ page: 1, limit: 1, getTotal: true }));
        dispatch(getAllBooks({ page: 1, limit: 1, getTotal: true }));
        dispatch(getAllAuthors({ page: 1, limit: 1, getTotal: true }));
        dispatch(getAllPublishers({ page: 1, limit: 1, getTotal: true }));
        dispatch(getAllOrders({ page: 1, limit: 1, getTotal: true }));
        dispatch(getAllReviews({ page: 1, limit: 1, getTotal: true }));
        
        // Lấy tổng doanh thu
        fetchTotalRevenue();
        // Lấy số lượng tài khoản đã xóa mềm
        fetchDeletedUsersCount();
    }, [dispatch]);

    // Hàm lấy tổng doanh thu
    const fetchTotalRevenue = async () => {
        try {
            setRevenueLoading(true);
            const response = await userService.getTotalRevenue();
            setTotalRevenue(response.data.totalRevenue || 0);
        } catch (error) {
            console.error('Error fetching total revenue:', error);
            toast.error('Không thể lấy thông tin doanh thu');
        } finally {
            setRevenueLoading(false);
        }
    };

    // Hàm lấy số lượng tài khoản đã xóa mềm
    const fetchDeletedUsersCount = async () => {
        try {
            setDeletedUsersLoading(true);
            const response = await userService.getDeletedUsersCount();
            setDeletedUsersCount(response.data.deletedUsersCount || 0);
        } catch (error) {
            console.error('Error fetching deleted users count:', error);
            toast.error('Không thể lấy thông tin tài khoản đã xóa');
        } finally {
            setDeletedUsersLoading(false);
        }
    };

    useEffect(() => {
        // Hiển thị lỗi nếu có
        const errors = [userError, categoryError, bookError, authorError, publisherError, orderError, reviewError];
        errors.forEach((error) => {
            if (error) {
                toast.error(error);
            }
        });
    }, [userError, categoryError, bookError, authorError, publisherError, orderError]);

    const isLoading = userLoading || categoryLoading || bookLoading || authorLoading || publisherLoading || orderLoading || reviewLoading || revenueLoading || deletedUsersLoading;

    // Lấy tổng số bản ghi từ pagination (hoặc từ backend nếu có trường totalCount)
    const stats = [
        {
            title: 'Người Dùng',
            count: userPagination?.totalItems || users.length || 0,
            icon: <FaUsers className="text-4xl text-blue-600" />,
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Danh Mục',
            count: categoryPagination?.totalItems || categories.length || 0,
            icon: <FaTags className="text-4xl text-green-600" />,
            bgColor: 'bg-green-100',
        },
        {
            title: 'Sách',
            count: bookPagination?.totalItems || books.length || 0,
            icon: <FaBook className="text-4xl text-indigo-600" />,
            bgColor: 'bg-indigo-100',
        },
        {
            title: 'Tác Giả',
            count: authorPagination?.totalItems || authors.length || 0,
            icon: <FaUserEdit className="text-4xl text-purple-600" />,
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Nhà Xuất Bản',
            count: publisherPagination?.totalItems || publishers.length || 0,
            icon: <FaBuilding className="text-4xl text-yellow-600" />,
            bgColor: 'bg-yellow-100',
        },
        {
            title: 'Đơn Hàng',
            count: orderPagination?.totalItems || orders.length || 0,
            icon: <FaShoppingCart className="text-4xl text-red-600" />,
            bgColor: 'bg-red-100',
        },
        {
            title: 'Đánh Giá',
            count: reviewPagination?.totalItems || adminReviews.length || 0,
            icon: <FaStar className="text-4xl text-orange-600" />,
            bgColor: 'bg-orange-100',
        },
        {
            title: 'Tổng Doanh Thu',
            count: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(totalRevenue),
            icon: <FaMoneyBillWave className="text-4xl text-emerald-600" />,
            bgColor: 'bg-emerald-100',
        },
        {
            title: 'Tài Khoản Đã Xóa',
            count: deletedUsersCount,
            icon: <FaUserTimes className="text-4xl text-gray-600" />,
            bgColor: 'bg-gray-100',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl mt-6">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-8 flex items-center">
                <FaUsers className="mr-3 text-blue-600" /> Dashboard Quản Trị
            </h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl text-gray-600 animate-pulse">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-lg shadow-md ${stat.bgColor} hover:shadow-lg transition duration-300 transform hover:scale-105`}
                        >
                            <div className="flex items-center space-x-4">
                                {stat.icon}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{stat.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;