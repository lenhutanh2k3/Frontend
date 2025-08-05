import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrderById, cancelOrder, retryPayment } from '../../features/order/orderSlice';
import Button from '../../components/common/Button';
import ReviewSection from '../../components/common/ReviewSection';
import ReviewForm from '../../components/common/ReviewForm';
import { getUserReviewForBook } from '../../features/review/reviewSlice';
import { 
    FaBox, 
    FaTruck, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaUndo, 
    FaArrowLeft,
    FaClock,
    FaMapMarkerAlt,
    FaPhone,
    FaUser,
    FaCreditCard,
    FaMoneyBillWave,
    FaPrint,
    FaDownload,
    FaShare,
    FaExclamationTriangle
} from 'react-icons/fa';

const ORDER_STATUS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELED: 'Canceled'
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

const OrderDetailPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedOrder, loading } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const [reviewingBook, setReviewingBook] = useState(null); // {bookId, title, ...}
    const [userReviews, setUserReviews] = useState({}); // { [bookId]: reviewObj }
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (id) {
            dispatch(getOrderById(id));
        }
    }, [dispatch, id]);

    // Lấy review của user cho từng sách trong đơn hàng khi đã giao thành công
    useEffect(() => {
        const fetchUserReviews = async () => {
            if (selectedOrder && selectedOrder.orderStatus === ORDER_STATUS.DELIVERED && user) {
                setLoadingReviews(true);
                const reviews = {};
                for (const item of selectedOrder.items) {
                    try {
                        const res = await dispatch(getUserReviewForBook({ bookId: item.bookId, orderId: selectedOrder._id })).unwrap();
                        if (res && res.review) {
                            reviews[item.bookId] = res.review;
                        }
                    } catch (e) {}
                }
                setUserReviews(reviews);
                setLoadingReviews(false);
            }
        };
        fetchUserReviews();
        // eslint-disable-next-line
    }, [selectedOrder, user]);

    const handleCancelOrder = async () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
            setIsLoading(true);
            try {
                await dispatch(cancelOrder(id)).unwrap();
    
                dispatch(getOrderById(id)); // Reload order data
            } catch (error) {
                console.error('Lỗi khi hủy đơn hàng:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleRetryPayment = async () => {
        setIsLoading(true);
        try {
            const result = await dispatch(retryPayment({ orderId: id })).unwrap();
            if (result.vnpUrl) {
                setRetryCount(0);
                window.location.href = result.vnpUrl;
            } else {
                setRetryCount(prev => prev + 1);
                toast.error('Không nhận được URL thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            // Check for backend confirmation flag
            if (error && error.shouldConfirmCancel) {
                if (window.confirm(error.message || 'Bạn đã thử lại thanh toán 3 lần không thành công. Bạn có muốn hủy đơn hàng này không?')) {
                    setIsLoading(true);
                    try {
                        await dispatch(cancelOrder(id)).unwrap();
                    } catch (cancelErr) {
                        toast.error('Không thể hủy đơn hàng.');
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    setRetryCount(0);
                }
            } else {
                setRetryCount(prev => prev + 1);
                if (typeof error === 'string') {
                    toast.error(error);
                } else if (error && error.message) {
                    toast.error(error.message);
                } else {
                    toast.error('Có lỗi xảy ra khi thanh toán lại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
                }
            }
        } finally {
            setIsLoading(false);
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

    const canRetryPayment = (order) => {
        return order.orderStatus === ORDER_STATUS.PENDING &&
               order.paymentStatus === PAYMENT_STATUS.UNPAID &&
               order.paymentMethod === PAYMENT_METHOD.VNPAY;
    };

    // Xóa hàm handlePrintOrder
    // Xóa hàm handleDownloadInvoice

    const handleShareOrder = () => {
        if (navigator.share) {
            navigator.share({
                title: `Đơn hàng ${selectedOrder.orderCode}`,
                text: `Xem chi tiết đơn hàng của tôi: ${window.location.href}`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Đã sao chép link vào clipboard!');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Vui lòng đăng nhập</h2>
                    <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem chi tiết đơn hàng.</p>
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    if (!selectedOrder) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy đơn hàng</h2>
                    <p className="text-gray-600 mb-6">Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                    <Button
                        onClick={() => navigate('/orders')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Quay lại danh sách đơn hàng
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-2 mb-2 lg:mb-0">
                        <Button
                            onClick={() => navigate('/orders')}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
                        >
                            <FaArrowLeft className="mr-2" />
                            Đơn hàng của tôi
                        </Button>
                        <span className={`ml-4 px-4 py-2 rounded-full text-base font-semibold ${getStatusColor(selectedOrder.orderStatus)}`}>{getStatusText(selectedOrder.orderStatus)}</span>
                        <span className={`ml-2 px-4 py-2 rounded-full text-base font-semibold ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus === PAYMENT_STATUS.PAID ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
                    </div>
                    
                </div>
                <div className="text-gray-600 mb-6">Mã đơn hàng: <span className="font-semibold text-gray-900">#{selectedOrder.orderCode}</span> | Đặt lúc {formatDate(selectedOrder.createdAt)}</div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin giao hàng/người nhận/thanh toán */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin giao hàng & thanh toán</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center mb-2"><FaUser className="mr-2 text-blue-600" /><span className="font-medium">{selectedOrder.fullName}</span></div>
                                    <div className="flex items-center mb-2"><FaPhone className="mr-2 text-blue-600" /><span>{selectedOrder.phoneNumber}</span></div>
                                    <div className="flex items-center"><FaMapMarkerAlt className="mr-2 text-blue-600" /><span>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.city}</span></div>
                                </div>
                                <div>
                                    <div className="flex items-center mb-2"><FaCreditCard className="mr-2 text-blue-600" /><span>Phương thức: <span className="font-medium">{selectedOrder.paymentMethod === PAYMENT_METHOD.COD ? 'Thanh toán khi nhận hàng (COD)' : 'VNPay'}</span></span></div>
                                    <div className="flex items-center"><FaClock className="mr-2 text-blue-600" /><span>Thời gian đặt: {formatDate(selectedOrder.createdAt)}</span></div>
                                </div>
                            </div>
                        </div>
                        {/* Danh sách sản phẩm */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sản phẩm đã đặt</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ảnh</th>
                                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tên sách</th>
                                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Số lượng</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Đơn giá</th>
                                            <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Thành tiền</th>
                                            <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Đánh giá</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedOrder.items.map((item, index) => {
                                            const review = userReviews[item.bookId];
                                            return (
                                                <tr key={index}>
                                                    <td className="px-4 py-2">
                                                        <img
                                                            src={
                                                                item.primaryImage?.startsWith('http')
                                                                    ? item.primaryImage
                                                                    : `${import.meta.env.VITE_BOOK_SERVICE}/${item.primaryImage || 'Uploads/default-image.jpg'}`
                                                            }
                                                            alt={item.title}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 font-medium text-gray-900">{item.title}</td>
                                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">{formatPrice(item.price)}</td>
                                                    <td className="px-4 py-2 text-right font-semibold">{formatPrice(item.price * item.quantity)}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        {selectedOrder.orderStatus === ORDER_STATUS.DELIVERED ? (
                                                            loadingReviews ? (
                                                                <span className="text-gray-400 italic">Đang kiểm tra...</span>
                                                            ) : review ? (
                                                                <span className="text-green-600 font-semibold">Đã đánh giá</span>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                                    onClick={() => setReviewingBook({
                                                                        bookId: item.bookId,
                                                                        title: item.title
                                                                    })}
                                                                >
                                                                    Đánh giá
                                                                </Button>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-400 italic">Chỉ đánh giá khi đã nhận hàng</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {/* Ghi chú đơn hàng */}
                        {selectedOrder.notes && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghi chú đơn hàng</h2>
                                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.notes}</p>
                            </div>
                        )}
                        {/* Popup ReviewForm */}
                        {reviewingBook && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                                        onClick={() => setReviewingBook(null)}
                                    >
                                        ×
                                    </button>
                                    <h3 className="text-lg font-bold mb-2">Đánh giá cho: {reviewingBook.title}</h3>
                                    <ReviewForm
                                        bookId={reviewingBook.bookId}
                                        orderId={selectedOrder._id}
                                        onSuccess={() => {
                                            setReviewingBook(null);
                                            // Sau khi đánh giá thành công, reload lại review cho sách này
                                            dispatch(getUserReviewForBook({ bookId: reviewingBook.bookId, orderId: selectedOrder._id }))
                                                .unwrap()
                                                .then(res => {
                                                    setUserReviews(prev => ({ ...prev, [reviewingBook.bookId]: res.review }));
                                                });
                                        }}
                                        onCancel={() => setReviewingBook(null)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Tóm tắt đơn hàng */}
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng tiền hàng:</span>
                                    <span className="font-medium">{formatPrice(selectedOrder.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span className="font-medium">{formatPrice(selectedOrder.shippingFee || 0)}</span>
                                </div>
                                {selectedOrder.totalDiscount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Giảm giá:</span>
                                        <span className="font-medium text-green-600">-{formatPrice(selectedOrder.totalDiscount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 my-2"></div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng thanh toán:</span>
                                    <span className="text-blue-600">{formatPrice(selectedOrder.finalAmount || (selectedOrder.totalAmount - (selectedOrder.totalDiscount || 0)))}</span>
                                </div>
                            </div>
                            {/* Nút thao tác chính */}
                            <div className="mt-6 flex flex-col gap-3">
                                {canCancelOrder(selectedOrder) && (
                                    <Button
                                        onClick={handleCancelOrder}
                                        disabled={isLoading}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                                    </Button>
                                )}
                                {canRetryPayment(selectedOrder) && (
                                    <Button
                                        onClick={handleRetryPayment}
                                        disabled={isLoading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Thanh toán lại'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage; 