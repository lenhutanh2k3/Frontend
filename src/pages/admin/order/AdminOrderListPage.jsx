import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders, cancelOrder, updateOrderStatus } from '../../../features/order/orderSlice';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { FaSearch, FaFilter, FaArrowLeft, FaArrowRight, FaEye, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';

const AdminOrderListPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, pagination, loading, error } = useSelector((state) => state.order);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    console.log("orders",orders);
    useEffect(() => {
        console.log("Fetching orders with params:", { page: currentPage, limit: 10, status: statusFilter, search: searchQuery });
        dispatch(getAllOrders({ page: currentPage, limit: 10, status: statusFilter, search: searchQuery }));
    }, [dispatch, currentPage, statusFilter, searchQuery]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewOrder = (id) => {
        navigate(`/admin/orders/${id}`);
    };

    const handleCancelOrder = (id) => {
        if (window.confirm('Bạn có chắc muốn hủy đơn hàng này? Việc này sẽ hoàn lại tồn kho.')) {
            dispatch(cancelOrder(id)).then(() => {
                dispatch(getAllOrders({ page: currentPage, limit: 10, status: statusFilter, search: searchQuery }));
            });
        }
    };

    const handleUpdateStatus = (orderId, currentStatus) => {
        let availableStatuses = [];
        switch (currentStatus) {
            case 'Pending':
                availableStatuses = ['Processing', 'Canceled'];
                break;
            case 'Processing':
                availableStatuses = ['Shipped', 'Canceled'];
                break;
            case 'Shipped':
                availableStatuses = ['Delivered', 'Returned'];
                break;
            case 'Delivered':
                availableStatuses = ['Returned'];
                break;
            case 'Canceled':
            case 'Returned':
                availableStatuses = [];
                break;
            default:
                availableStatuses = [];
        }

        if (availableStatuses.length === 0) {
            alert(`Không thể thay đổi trạng thái của đơn hàng đang ở trạng thái "${statusMap[currentStatus] || currentStatus}".`);
            return;
        }

        const newStatus = prompt(`Cập nhật trạng thái đơn hàng (hiện tại: ${statusMap[currentStatus] || currentStatus}).\nChọn trạng thái mới: ${availableStatuses.join(', ')}`);

        if (newStatus && availableStatuses.includes(newStatus)) {
            dispatch(updateOrderStatus({ id: orderId, newStatusData: { newStatus } })).then(() => {
                dispatch(getAllOrders({ page: currentPage, limit: 10, status: statusFilter, search: searchQuery }));
            });
        } else if (newStatus !== null) {
            alert('Trạng thái nhập không hợp lệ hoặc không có trong danh sách cho phép.');
        }
    };

    const statusMap = {
        Pending: 'Chờ xử lý',
        Processing: 'Đang xử lý',
        Shipped: 'Đã giao',
        Delivered: 'Đã giao thành công',
        Canceled: 'Đã hủy',
        Returned: 'Đã trả hàng'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-xl text-gray-600 animate-pulse">Đang tải danh sách đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64 bg-red-50 rounded-lg border border-dashed border-red-300">
                <p className="text-xl text-red-600 flex items-center">
                    <FaTimes className="mr-2" /> {error}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-xl mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight flex items-center">
                    <FaFilter className="mr-3 text-blue-600" /> Quản lý Đơn Hàng
                </h1>
                
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái:</label>
                    <select
                        id="statusFilter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Tất cả</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Processing">Đang xử lý</option>
                        <option value="Shipped">Đã giao</option>
                        <option value="Delivered">Đã giao thành công</option>
                        <option value="Canceled">Đã hủy</option>
                        <option value="Returned">Đã trả hàng</option>
                    </select>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xl text-gray-600 flex items-center">
                        <FaTimes className="mr-2 text-red-500" /> Không tìm thấy đơn hàng nào.
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
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã Đơn</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên Khách</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tổng Thanh Toán</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng Thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày Tạo</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {orders.map((order, index) => (
                                        <tr key={order._id} className="hover:bg-blue-50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                                                {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderCode}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="font-bold text-blue-700">{order.finalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                                                <div className="text-xs text-gray-500">Hàng: {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                                                <div className="text-xs text-gray-500">Ship: {order.shippingFee ? order.shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0₫'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'Canceled' || order.orderStatus === 'Returned' ? 'bg-red-100 text-red-800' : order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {statusMap[order.orderStatus] || order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-3">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition duration-150"
                                                        onClick={() => handleViewOrder(order._id)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <FaEye className="text-lg" />
                                                    </button>
                                                  
                                                
                                                    {!(['Delivered', 'Canceled', 'Returned'].includes(order.orderStatus)) && order.paymentStatus !== 'Paid' && (
                                                        <button
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition duration-150"
                                                            onClick={() => handleCancelOrder(order._id)}
                                                            title="Hủy đơn hàng"
                                                        >
                                                            <FaTrash className="text-lg" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {pagination && pagination.totalPages > 0 && (
                        <div className="mt-8 flex justify-center items-center space-x-3">
                            {/* Nút Previous */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
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
                                    onClick={() => handlePageChange(number)}
                                    className={`px-4 py-2 rounded-full font-semibold transition duration-300 ${pagination.currentPage === number ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {number}
                                </button>
                            ))}
                            
                            {/* Nút Next */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
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

export default AdminOrderListPage;