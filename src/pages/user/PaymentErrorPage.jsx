// src/pages/PaymentErrorPage.jsx
import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';

const PaymentErrorPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('message') || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.';
    const orderId = params.get('orderId'); // Có thể có orderId nếu lỗi xảy ra sau khi tạo đơn hàng

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
                        onClick={() => window.history.back()} // Quay lại trang trước (có thể là checkout)
                        className="block w-full bg-orange-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-orange-700 transition duration-300 transform hover:scale-105"
                    >
                        <FaArrowLeft className="inline-block mr-2" /> Thử lại / Quay lại
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