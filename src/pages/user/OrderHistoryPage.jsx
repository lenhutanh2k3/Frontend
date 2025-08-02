import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrdersByUser, cancelOrder } from '../../features/order/orderSlice';
import Button from '../../components/common/Button';
import { 
    FaBox, 
    FaTruck, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaUndo, 
    FaEye, 
    FaClock,
    FaSearch,
    FaFilter,
    FaSort
} from 'react-icons/fa';

const ORDER_STATUS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELED: 'Canceled',
};

const PAYMENT_STATUS = {
    UNPAID: 'Unpaid',
    PAID: 'Paid',
    REFUNDED: 'Refunded'
};

const PAYMENT_METHOD = {
    COD: 'COD',
    VNPAY: 'VNPAY'
};

const OrderHistoryPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, pagination, loading } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.auth);

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadOrders();
    }, [currentPage, statusFilter, searchTerm, sortBy, sortOrder]);

    const loadOrders = async () => {
        const params = {
            page: currentPage,
            limit: 5,
            ...(statusFilter && { status: statusFilter }),
            ...(searchTerm && { search: searchTerm }),
            sortBy,
            sortOrder
        };
        
        try {
            await dispatch(getOrdersByUser(params)).unwrap();
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            try {
                await dispatch(cancelOrder(orderId)).unwrap();
                toast.success('Đơn hàng đã được hủy thành công!');
                loadOrders(); // Reload danh sách
            } catch (error) {
                console.error('Lỗi khi hủy đơn hàng:', error);
            }
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return <FaClock className="text-yellow-500" />;
            case ORDER_STATUS.PROCESSING:
                return <FaBox className="text-blue-500" />;
            case ORDER_STATUS.SHIPPED:
                return <FaTruck className="text-purple-500" />;
            case ORDER_STATUS.DELIVERED:
                return <FaCheckCircle className="text-green-500" />;
            case ORDER_STATUS.CANCELED:
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClock className="text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return 'Chờ xử lý';
            case ORDER_STATUS.PROCESSING:
                return 'Đang xử lý';
            case ORDER_STATUS.SHIPPED:
                return 'Đang giao hàng';
            case ORDER_STATUS.DELIVERED:
                return 'Đã giao hàng';
            case ORDER_STATUS.CANCELED:
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case ORDER_STATUS.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case ORDER_STATUS.PROCESSING:
                return 'bg-blue-100 text-blue-800';
            case ORDER_STATUS.SHIPPED:
                return 'bg-purple-100 text-purple-800';
            case ORDER_STATUS.DELIVERED:
                return 'bg-green-100 text-green-800';
            case ORDER_STATUS.CANCELED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case PAYMENT_STATUS.PAID:
                return 'bg-green-100 text-green-800';
            case PAYMENT_STATUS.UNPAID:
                return 'bg-red-100 text-red-800';
            case PAYMENT_STATUS.REFUNDED:
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const canCancelOrder = (order) => {
        return order.orderStatus === ORDER_STATUS.PENDING && 
               order.paymentStatus === PAYMENT_STATUS.UNPAID;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h2>
                    <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
                    <Button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Đăng nhập
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch Sử Đơn Hàng</h1>
                    <p className="text-gray-600">Theo dõi tất cả đơn hàng của bạn</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="">Tất cả trạng thái</option>
                                {Object.entries(ORDER_STATUS).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {getStatusText(value)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                <option value="createdAt-desc">Mới nhất</option>
                                <option value="createdAt-asc">Cũ nhất</option>
                                <option value="totalAmount-desc">Giá cao nhất</option>
                                <option value="totalAmount-asc">Giá thấp nhất</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FaBox className="text-gray-400 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                        <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
                        <Button
                            onClick={() => navigate('/books')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Mua sắm ngay
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(order.orderStatus)}
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                                                    {getStatusText(order.orderStatus)}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                {order.paymentStatus === PAYMENT_STATUS.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </span>
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => navigate(`/orders/${order._id}`)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                                                >
                                                    <FaEye className="mr-1" />
                                                    Chi tiết
                                                </Button>
                                                {canCancelOrder(order) && (
                                                    <Button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                    >
                                                        Hủy đơn
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">
                                                    Mã đơn hàng: {order.orderCode}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-medium">Người nhận:</span> {order.fullName}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    <span className="font-medium">SĐT:</span> {order.phoneNumber}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Địa chỉ:</span> {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.city}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    {formatPrice(order.finalAmount)}
                                                </p>
                                                <p className="text-sm text-gray-600">Tổng tiền hàng: {formatPrice(order.totalAmount)}</p>
                                                <p className="text-sm text-gray-600">Phí vận chuyển: {formatPrice(order.shippingFee || 0)}</p>
                                                {order.discountAmount > 0 && (
                                                    <p className="text-sm text-green-600">Giảm giá: -{formatPrice(order.discountAmount)}</p>
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    {order.items.length} sản phẩm
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {order.paymentMethod === PAYMENT_METHOD.COD ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-medium text-gray-900 mb-3">Sản phẩm đã đặt:</h4>
                                            <div className="space-y-2">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <div key={index} className="flex items-center space-x-3">
                                                        <img
                                                            src={
                                                                item.primaryImage?.startsWith('http')
                                                                    ? item.primaryImage
                                                                    : `${import.meta.env.VITE_BOOK_SERVICE}/${item.primaryImage || 'Uploads/default-image.jpg'}`
                                                            }
                                                            alt={item.title}
                                                            className="w-12 h-12 object-cover rounded"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                                            <p className="text-xs text-gray-600">
                                                                Số lượng: {item.quantity} x {formatPrice(item.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <p className="text-sm text-gray-600 text-center">
                                                        Và {order.items.length - 3} sản phẩm khác...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}



                {/* Pagination */}
                {pagination?.totalPages >= 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </Button>
                            
                            {/* Hiển thị số trang thông minh */}
                            {(() => {
                                const pages = [];
                                const totalPages = pagination.totalPages;
                                const current = currentPage;
                                
                                // Luôn hiển thị trang đầu
                                pages.push(1);
                                
                                if (totalPages <= 7) {
                                    // Nếu ít trang, hiển thị tất cả
                                    for (let i = 2; i <= totalPages; i++) {
                                        pages.push(i);
                                    }
                                } else {
                                    // Nếu nhiều trang, hiển thị thông minh
                                    if (current > 3) {
                                        pages.push('...');
                                    }
                                    
                                    const start = Math.max(2, current - 1);
                                    const end = Math.min(totalPages - 1, current + 1);
                                    
                                    for (let i = start; i <= end; i++) {
                                        if (i !== 1 && i !== totalPages) {
                                            pages.push(i);
                                        }
                                    }
                                    
                                    if (current < totalPages - 2) {
                                        pages.push('...');
                                    }
                                    
                                    if (totalPages > 1) {
                                        pages.push(totalPages);
                                    }
                                }
                                
                                return pages.map((page, index) => (
                                    <div key={index}>
                                        {page === '...' ? (
                                            <span className="px-3 py-2 text-gray-500">...</span>
                                        ) : (
                                            <Button
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 border rounded-lg ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </Button>
                                        )}
                                    </div>
                                ));
                            })()}
                            
                            <Button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </Button>
                        </div>
                        
                        
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage; 