// src/pages/OrderSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaClipboardList } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderById } from '../../features/order/orderSlice';

const OrderSuccessPage = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { selectedOrder, loading, error } = useSelector((state) => state.order);
    // THAY ĐỔI: Đọc từ URL query params
    const params = new URLSearchParams(location.search);
    const passedOrderId = params.get('orderId') || location.state?.orderId; // Ưu tiên query param, fallback về state
    const paymentMethod = params.get('method') || location.state?.method; // Ưu tiên query param, fallback về state

    const [displayOrder, setDisplayOrder] = useState(null);

    useEffect(() => {
        if (passedOrderId) {
            dispatch(getOrderById(passedOrderId));
        } else {
            // Trường hợp không có orderId được truyền, có thể xử lý lỗi hoặc chuyển hướng
            // Ví dụ: toast.error("Không tìm thấy thông tin đơn hàng.");
            // navigate('/');
        }
    }, [dispatch, passedOrderId]);

    useEffect(() => {
        if (selectedOrder && selectedOrder._id === passedOrderId) {
            setDisplayOrder(selectedOrder);
        }
    }, [selectedOrder, passedOrderId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-5 md:p-12 text-center max-w-md animate-fadeInUp">
                <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-6 animate-bounceIn" />
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                    Đặt hàng thành công!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Đơn hàng của bạn đã được tiếp nhận và xử lý.
                </p>

                {loading ? (
                    <p className="text-blue-500 mb-4">Đang tải chi tiết đơn hàng...</p>
                ) : error ? (
                    <p className="text-red-500 mb-4">Không thể tải chi tiết đơn hàng: {error}</p>
                ) : displayOrder ? (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 text-left">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                            <FaClipboardList className="mr-2" /> Thông tin đơn hàng
                        </h2>
                        <p className="text-gray-700 mb-2"><strong>Mã đơn hàng:</strong> {displayOrder._id}</p>
                        <p className="text-gray-700 mb-2"><strong>Tổng tiền:</strong> {displayOrder.finalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                        <p className="text-gray-700 mb-2">
                            <strong>Phương thức thanh toán:</strong> {
                                paymentMethod === 'VNPAY' ? 'VNPay (Đã thanh toán)' :
                                    paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' :
                                        displayOrder.paymentMethod === 'VNPAY' ? 'VNPay (Đã thanh toán)' : // Fallback nếu không có method từ URL/state
                                            displayOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Không xác định'
                            }
                        </p>
                        <p className="text-gray-700"><strong>Trạng thái:</strong> {displayOrder.orderStatus}</p>
                    </div>
                ) : (
                    <p className="text-gray-600 mb-4">Chi tiết đơn hàng đang được cập nhật.</p>
                )}

                <div className="space-y-4">
                    <Link
                        to="/orders"
                        className="block w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
                    >
                        Xem đơn hàng của tôi
                    </Link>
                    <Link
                        to="/bookstore"
                        className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition duration-300 transform hover:scale-105"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;