// src/pages/PaymentErrorPage.jsx
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { retryPayment, cancelOrder } from '../../features/order/orderSlice';
import { toast } from 'react-toastify';

const PaymentErrorPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('message') || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.';
    const orderId = params.get('orderId');
    const [isLoading, setIsLoading] = useState(false);

    const handleRetry = async () => {
        if (!orderId) {
            window.history.back();
            return;
        }
        setIsLoading(true);
        try {
            const result = await dispatch(retryPayment({ orderId })).unwrap();
            if (result.vnpUrl) {
                window.location.href = result.vnpUrl;
            } else {
                toast.error('Không nhận được URL thanh toán. Vui lòng thử lại.');
            }
        } catch (error) {
            if (error && error.shouldConfirmCancel) {
                
                if (window.confirm(error.message || 'Bạn đã thanh toán thất bại 3 lần. Bạn có muốn hủy đơn hàng không?')) {
                    try {
                        await dispatch(cancelOrder(orderId)).unwrap();
                        toast.info('Đơn hàng đã bị hủy sau 3 lần thử lại thanh toán không thành công.');
                        navigate('/orders');
                    } catch (cancelErr) {
                        toast.error('Không thể hủy đơn hàng.');
                    }
                }
            } else {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 text-center max-w-md w-full animate-fadeInUp">
                <FaExclamationCircle className="text-red-500 text-6xl mx-auto mb-6 animate-bounceIn" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Thanh toán thất bại!
                </h1>
                <p className="text-lg text-red-600 mb-6">
                    {errorMessage}
                </p>

                {orderId && (
                    <p className="text-gray-700 mb-4">
                        Mã đơn hàng liên quan (nếu có): <strong>{orderId}</strong>
                    </p>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleRetry}
                        disabled={isLoading}
                        className="block w-full bg-orange-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition duration-300 transform hover:scale-105 disabled:opacity-60"
                    >
                        <FaArrowLeft className="inline-block mr-2" /> Thử lại thanh toán
                    </button>
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

export default PaymentErrorPage;