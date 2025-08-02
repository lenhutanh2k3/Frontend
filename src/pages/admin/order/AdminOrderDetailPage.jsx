import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../../features/order/orderSlice';
import { toast } from 'react-toastify';
import Button from '../../../components/common/Button';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const baseUrl = import.meta.env.VITE_BOOK_SERVICE || '';
const ORDER_STATUS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELED: 'Canceled',
    REFUNDED: 'Refunded'
};

const AdminOrderDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedOrder, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(getOrderById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleStatusUpdate = (status) => {
        const newStatus = ORDER_STATUS[status.toUpperCase()];
        if (!newStatus) {
            toast.error('Trạng thái không hợp lệ.');
            return;
        }
        if (window.confirm(`Bạn có chắc muốn cập nhật trạng thái thành "${statusMap[newStatus]}"?`)) {
            dispatch(updateOrderStatus({ id, newStatusData: { newStatus } }))
                .unwrap()
                .then(() => {
                    toast.success(`Cập nhật trạng thái thành ${statusMap[newStatus]}`);
                    dispatch(getOrderById(id));
                })
                .catch((err) => {
                    toast.error(err || 'Không thể cập nhật trạng thái đơn hàng.');
                });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-6">
                <div className="flex flex-col items-center justify-center text-indigo-700 animate-pulse">
                    <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-semibold">Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error && !selectedOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
                <div className="text-center text-red-700">
                    <h2 className="text-2xl font-bold mb-2">Lỗi!</h2>
                    <p>{error}</p>
                    <Button onClick={() => navigate('/admin/orders')} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Quay lại</Button>
                </div>
            </div>
        );
    }

    if (!selectedOrder) return null;

    const statusMap = {
        [ORDER_STATUS.PENDING]: 'Chờ xử lý',
        [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
        [ORDER_STATUS.SHIPPED]: 'Đã giao',
        [ORDER_STATUS.DELIVERED]: 'Đã giao thành công',
        [ORDER_STATUS.CANCELED]: 'Đã hủy',
        [ORDER_STATUS.REFUNDED]: 'Đã hoàn tiền'
    };

    // Tính toán các giá trị tổng kết
    const totalItemPrice = selectedOrder.totalItemPrice || selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = selectedOrder.shippingFee || 0;
    const finalTotal = selectedOrder.finalAmount || totalItemPrice + shippingFee;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
            <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b-2 border-indigo-200 pb-2">
                        <h1 className="text-2xl font-extrabold text-gray-900">Chi Tiết Đơn Hàng #{selectedOrder.orderCode}</h1>
                        <Button
                            onClick={() => navigate('/admin/orders')}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg flex items-center"
                        >
                            <FaArrowLeft className="mr-1" /> Quay lại
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Cột trái: Thông tin khách + Sản phẩm */}
                        <div className="md:col-span-2 space-y-5">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">Thông Tin Khách Hàng</h2>
                                <p><strong>Tên:</strong> {selectedOrder.fullName}</p>
                                <p><strong>Số điện thoại:</strong> {selectedOrder.phoneNumber}</p>
                                <p><strong>Địa chỉ:</strong> {`${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.ward}, ${selectedOrder.shippingAddress.city}`}</p>
                                <p><strong>Phương thức thanh toán:</strong> 
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                        selectedOrder.paymentMethod === 'COD' 
                                            ? 'bg-orange-100 text-orange-800' 
                                            : selectedOrder.paymentMethod === 'VNPAY'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 
                                         selectedOrder.paymentMethod === 'VNPAY' ? 'Thanh toán qua VNPAY' : 
                                         selectedOrder.paymentMethod || 'Không xác định'}
                                    </span>
                                </p>
                                <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">Sản Phẩm</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                                        <thead className="bg-indigo-100">
                                            <tr>
                                                <th className="p-2 font-semibold">Ảnh</th>
                                                <th className="p-2 font-semibold">Tên sách</th>
                                                <th className="p-2 font-semibold">Số lượng</th>
                                                <th className="p-2 font-semibold">Giá</th>
                                                <th className="p-2 font-semibold">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map(item => (
                                                <tr key={item._id} className="border-b border-gray-100 hover:bg-indigo-50">
                                                    <td className="p-2">
                                                        <img
                                                            src={item.primaryImage ? `${baseUrl}/${item.primaryImage}` : 'https://via.placeholder.com/80'}
                                                            alt={item.title}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                    </td>
                                                    <td className="p-2 font-medium text-gray-800">{item.title}</td>
                                                    <td className="p-2">{item.quantity}</td>
                                                    <td className="p-2">
                                                        <span className="font-semibold">{item.price.toLocaleString()} VNĐ</span>
                                                    </td>
                                                    <td className="p-2 font-semibold">{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        {/* Cột phải: Tổng kết + Trạng thái + Thao tác */}
                        <div className="space-y-5">
                            <div className="bg-indigo-50 p-4 rounded-lg shadow">
                                <h2 className="text-lg font-semibold text-indigo-700 mb-4">Tổng Kết Đơn Hàng</h2>
                                <div className="flex justify-between mb-2">
                                    <span>Tổng giá sản phẩm:</span>
                                    <span className="font-semibold">{totalItemPrice.toLocaleString()} VNĐ</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-semibold">{shippingFee.toLocaleString()} VNĐ</span>
                                </div>
                                <hr className="my-2 border-indigo-200" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng thanh toán:</span>
                                    <span className="text-indigo-700">{finalTotal.toLocaleString()} VNĐ</span>
                                </div>
                                <hr className="my-2 border-indigo-200" />
                                <div className="flex justify-between items-center">
                                    <span>Phương thức thanh toán:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedOrder.paymentMethod === 'COD' 
                                            ? 'bg-orange-100 text-orange-800' 
                                            : selectedOrder.paymentMethod === 'VNPAY'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedOrder.paymentMethod === 'COD' ? 'COD' : 
                                         selectedOrder.paymentMethod === 'VNPAY' ? 'VNPAY' : 
                                         selectedOrder.paymentMethod || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-lg font-semibold text-gray-700 mb-2">Trạng Thái</h2>
                                <p className="mb-2">Trạng thái hiện tại: <span className="font-bold text-indigo-700">{statusMap[selectedOrder.orderStatus] || selectedOrder.orderStatus}</span></p>
                                <p className="mb-2">Trạng thái thanh toán: <span className="font-bold text-indigo-700">{selectedOrder.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>
                                <p className="mb-4">Cập nhật lần cuối: <span className="font-medium text-gray-600">{new Date(selectedOrder.updatedAt).toLocaleString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span></p>
                                <div className="grid grid-cols-1 gap-3">
                                    {/* Kiểm tra điều kiện thanh toán */}
                                    {selectedOrder.paymentStatus === 'Paid' || selectedOrder.paymentMethod === 'COD' ? (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate('PROCESSING')}
                                                disabled={selectedOrder.orderStatus === ORDER_STATUS.PROCESSING || selectedOrder.orderStatus === ORDER_STATUS.DELIVERED || selectedOrder.orderStatus === ORDER_STATUS.CANCELED}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                                            >
                                                <FaCheckCircle className="mr-2" /> Đang xử lý
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusUpdate('SHIPPED')}
                                                disabled={selectedOrder.orderStatus === ORDER_STATUS.SHIPPED || selectedOrder.orderStatus === ORDER_STATUS.DELIVERED || selectedOrder.orderStatus === ORDER_STATUS.CANCELED}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                                            >
                                                <FaCheckCircle className="mr-2" /> Đã giao
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusUpdate('DELIVERED')}
                                                disabled={selectedOrder.orderStatus === ORDER_STATUS.DELIVERED || selectedOrder.orderStatus === ORDER_STATUS.CANCELED}
                                                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                                            >
                                                <FaCheckCircle className="mr-2" /> Hoàn thành
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-yellow-800 font-medium mb-2">⚠️ Chưa thể cập nhật trạng thái</p>
                                            <p className="text-sm text-yellow-700">
                                                Đơn hàng chưa thanh toán. Vui lòng chờ khách hàng thanh toán trước khi xử lý.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailPage;