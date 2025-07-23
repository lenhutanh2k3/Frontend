import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { createOrder, createVnpayPaymentUrlThunk } from '../../features/order/orderSlice';
import { getAddresses } from '../../features/address/addressSlice';
import { getProfile } from '../../features/profile/profileSlice';
import { FaMoneyBillWave, FaCreditCard, FaMapMarkerAlt, FaUser, FaPhone, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import order_service from '../../services/orderService';
import { getCart } from '../../features/cart/cartSlice';
const PAYMENT_METHODS = {
    COD: 'COD',
    VNPAY: 'VNPAY',
};
const SHIPPING_FEE = 30000;

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const selectedCartItems = location.state?.selectedCartItems || [];
    const { user: currentUser, loading: userLoading } = useSelector((state) => state.auth);
    const { addresses, loading: addressesLoading } = useSelector((state) => state.address);
    const { loading: orderLoading, error: orderError, order: orderState } = useSelector((state) => state.order) || {};

    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.COD);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [customShippingAddress, setCustomShippingAddress] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        ward: '',
        district: '',
        city: '',
    });
    const [note, setNote] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [orderPreview, setOrderPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    useEffect(() => {
        dispatch(getProfile());
        dispatch(getAddresses());
    }, [dispatch]);

    useEffect(() => {
        if (currentUser && !userLoading) {
            setCustomShippingAddress(prev => ({
                ...prev,
                fullName: currentUser.fullName || '',
                phoneNumber: currentUser.phoneNumber || '',
            }));
        }

        const defaultAddr = addresses?.find(addr => addr.isDefault);
        if (defaultAddr && !selectedAddressId) {
            setSelectedAddressId(defaultAddr._id);
            setCustomShippingAddress(prev => ({
                ...prev,
                address: defaultAddr.address || '',
                ward: defaultAddr.ward || '',
                city: defaultAddr.city || '',
                fullName: defaultAddr.fullName || currentUser?.fullName || '',
                phoneNumber: defaultAddr.phoneNumber || currentUser?.phoneNumber || '',
            }));
        } else if (!defaultAddr && !selectedAddressId) {
            setSelectedAddressId('new');
            setCustomShippingAddress(prev => ({
                ...prev,
                address: '',
                ward: '',
                city: '',
            }));
        } else if (selectedAddressId === 'new') {
            setCustomShippingAddress(prev => ({
                ...prev,
                address: '',
                ward: '',
                city: '',
            }));
        }
    }, [currentUser, userLoading, addresses, selectedAddressId]);

    const defaultAddress = addresses?.find(addr => addr.isDefault);

    // Hàm gọi API previewOrder
    const fetchOrderPreview = async () => {
        setPreviewLoading(true);
        try {
            const payload = {
                items: selectedCartItems.map(item => ({
                    bookId: item.bookId,
                    quantity: item.quantity,
                    price: (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : ((item.price !== undefined && item.price !== null) ? item.price : 0)
                })),
            };
            const res = await order_service.previewOrder(payload);
            setOrderPreview(res.data);
        } catch (err) {
            setOrderPreview(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Gọi preview khi vào trang checkout hoặc khi thay đổi địa chỉ/giỏ hàng
    useEffect(() => {
        if (selectedCartItems.length > 0 && (customShippingAddress.fullName || defaultAddress)) {
            fetchOrderPreview();
        }
        // eslint-disable-next-line
    }, [selectedCartItems, selectedAddressId, customShippingAddress, defaultAddress]);

    // Thay các biến subtotal, shippingFee, finalAmount bằng orderPreview nếu có
    const subtotal = orderPreview?.totalAmount ?? selectedCartItems.reduce((sum, item) => {
        const safePrice = (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : ((item.price !== undefined && item.price !== null) ? item.price : 0);
        return sum + (safePrice * (item.quantity || 0));
    }, 0);
    const shippingFee = orderPreview?.shippingFee ?? SHIPPING_FEE;
    const finalAmount = orderPreview?.finalAmount ?? (subtotal + shippingFee);

    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        if (!customShippingAddress.fullName.trim()) {
            newErrors.fullName = 'Họ và tên không được để trống.';
            isValid = false;
        }
        if (!customShippingAddress.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Số điện thoại không được để trống.';
            isValid = false;
        } else if (!/^(0|\+84)(3|5|7|8|9)\d{8}$/.test(customShippingAddress.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ (ví dụ: 0912345678).';
            isValid = false;
        }

        if (selectedAddressId === 'new') {
            if (!customShippingAddress.address.trim()) {
                newErrors.address = 'Địa chỉ cụ thể không được để trống.';
                isValid = false;
            }
            if (!customShippingAddress.ward.trim()) {
                newErrors.ward = 'Phường/Xã không được để trống.';
                isValid = false;
            }
            if (!customShippingAddress.district.trim()) {
                newErrors.district = 'Quận/Huyện không được để trống.';
                isValid = false;
            }
            if (!customShippingAddress.city.trim()) {
                newErrors.city = 'Tỉnh/Thành phố không được để trống.';
                isValid = false;
            }
        }

        setFormErrors(newErrors);
        return isValid;
    }, [customShippingAddress, selectedAddressId]);

    const handleShippingInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomShippingAddress((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddressOptionChange = (e) => {
        const value = e.target.value;
        setSelectedAddressId(value);
        setFormErrors({});

        const defaultAddr = addresses?.find(addr => addr.isDefault);
        if (value === 'new') {
            setCustomShippingAddress(prev => ({
                ...prev,
                fullName: currentUser?.fullName || '',
                phoneNumber: currentUser?.phoneNumber || '',
                address: '',
                ward: '',
                city: '',
            }));
        } else if (defaultAddr && value === defaultAddr._id) {
            setCustomShippingAddress(prev => ({
                ...prev,
                fullName: defaultAddr.fullName || currentUser?.fullName || '',
                phoneNumber: defaultAddr.phoneNumber || currentUser?.phoneNumber || '',
                address: defaultAddr.address || '',
                ward: defaultAddr.ward || '',
                district: defaultAddr.district || '',
                city: defaultAddr.city || '',
            }));
        }
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin giao hàng.');
            return;
        }

        if (selectedCartItems.length === 0) {
            toast.error('Không có sản phẩm nào trong đơn hàng. Vui lòng quay lại giỏ hàng.');
            navigate('/cart');
            return;
        }

        let orderPayload = {
            phoneNumber: customShippingAddress.phoneNumber,
            fullName: customShippingAddress.fullName,
            paymentMethod,
            items: selectedCartItems.map(item => ({
                bookId: item.bookId,
                quantity: item.quantity,
                price: (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : ((item.price !== undefined && item.price !== null) ? item.price : 0)
            })),
            note: note.trim(),
        };

        if (currentUser && currentUser.email) {
            
            orderPayload.userEmail = currentUser.email;
        }

        const defaultAddr = addresses?.find(addr => addr.isDefault);
        if (selectedAddressId !== 'new' && defaultAddr && selectedAddressId === defaultAddr._id) {
            orderPayload.savedAddressId = selectedAddressId;
        } else {
            orderPayload.shippingAddress = {
                address: customShippingAddress.address,
                ward: customShippingAddress.ward,
                district: customShippingAddress.district,
                city: customShippingAddress.city,
            };
        }

        try {
            const response = await dispatch(createOrder(orderPayload)).unwrap();
            if (paymentMethod === PAYMENT_METHODS.VNPAY && response.orderId && response.paymentId && response.finalAmount) {
                const vnpayResponse = await dispatch(createVnpayPaymentUrlThunk({
                    orderId: response.orderId,
                    paymentId: response.paymentId,
                    amount: response.finalAmount, // Đúng với backend
                    bankCode: '',
                    language: 'vn',
                })).unwrap();

                if (vnpayResponse.vnpUrl) {
                    window.location.href = vnpayResponse.vnpUrl;
                } else {
                    toast.error('Không thể tạo URL thanh toán VNPay. Vui lòng thử lại.');
                    navigate('/payment/error?message=' + encodeURIComponent('Không thể tạo URL thanh toán VNPay.'));
                }
            } else if (paymentMethod === PAYMENT_METHODS.COD) {
                // Không gọi lại getCart ở đây nữa
                navigate('/order-success', { state: { orderId: response.order._id, method: 'COD' } });
            }
        } catch (err) {
            toast.error(err || 'Lỗi khi đặt hàng. Vui lòng thử lại.');
            console.error('Lỗi đặt hàng (CheckoutPage):', err);
        }
    };

    if (userLoading || addressesLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
            </div>
        );
    }

    if (selectedCartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <FaExclamationCircle className="text-red-500 text-5xl mb-4 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có sản phẩm để thanh toán</h2>
                    <p className="text-gray-600 mb-6">Vui lòng quay lại giỏ hàng và chọn sản phẩm để tiếp tục.</p>
                    <Button
                        onClick={() => navigate('/cart')}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                    >
                        <FaArrowLeft className="mr-2" /> Quay lại giỏ hàng
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-10 text-center">Thanh Toán Đơn Hàng</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <FaMapMarkerAlt className="mr-2 text-blue-600" />
                                Thông Tin Giao Hàng
                            </h2>
                            <div className="mb-4">
                                <label htmlFor="address-option" className="block text-sm font-medium text-gray-700 mb-2">
                                    Chọn địa chỉ giao hàng
                                </label>
                                <select
                                    id="address-option"
                                    value={selectedAddressId}
                                    onChange={handleAddressOptionChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    {defaultAddress && (
                                        <option value={defaultAddress._id}>
                                            Địa chỉ mặc định: {defaultAddress.fullName} - {defaultAddress.phoneNumber} - {defaultAddress.address}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
                                        </option>
                                    )}
                                    <option value="new">Nhập địa chỉ mới</option>
                                </select>
                            </div>
                            {selectedAddressId !== 'new' && defaultAddress && selectedAddressId === defaultAddress._id ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="font-semibold text-gray-800">{defaultAddress.fullName}</p>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <FaPhone className="mr-2 text-gray-500" />
                                        {defaultAddress.phoneNumber}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                        {defaultAddress.address}, {defaultAddress.ward}, {defaultAddress.district}, {defaultAddress.city}
                                    </p>
                                    <span className="inline-block mt-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                        Địa chỉ mặc định
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Nhập địa chỉ giao hàng mới</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Họ và tên"
                                            type="text"
                                            name="fullName"
                                            value={customShippingAddress.fullName}
                                            onChange={handleShippingInfoChange}
                                            required
                                            error={formErrors.fullName}
                                            icon={<FaUser className="text-gray-500" />}
                                        />
                                        <Input
                                            label="Số điện thoại"
                                            type="text"
                                            name="phoneNumber"
                                            value={customShippingAddress.phoneNumber}
                                            onChange={handleShippingInfoChange}
                                            required
                                            error={formErrors.phoneNumber}
                                            icon={<FaPhone className="text-gray-500" />}
                                        />
                                        <Input
                                            label="Tỉnh/Thành phố"
                                            type="text"
                                            name="city"
                                            value={customShippingAddress.city}
                                            onChange={handleShippingInfoChange}
                                            required
                                            error={formErrors.city}
                                            icon={<FaMapMarkerAlt className="text-gray-500" />}
                                        />
                                        <Input
                                            label="Quận/Huyện"
                                            type="text"
                                            name="district"
                                            value={customShippingAddress.district}
                                            onChange={handleShippingInfoChange}
                                            required
                                            error={formErrors.district}
                                            icon={<FaMapMarkerAlt className="text-gray-500" />}
                                        />
                                        <Input
                                            label="Phường/Xã"
                                            type="text"
                                            name="ward"
                                            value={customShippingAddress.ward}
                                            onChange={handleShippingInfoChange}
                                            required
                                            error={formErrors.ward}
                                            icon={<FaMapMarkerAlt className="text-gray-500" />}
                                        />
                                        <div className="col-span-1 md:col-span-2">
                                            <Input
                                                label="Địa chỉ cụ thể (Số nhà, tên đường)"
                                                type="text"
                                                name="address"
                                                value={customShippingAddress.address}
                                                onChange={handleShippingInfoChange}
                                                required
                                                error={formErrors.address}
                                                icon={<FaMapMarkerAlt className="text-gray-500" />}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ghi Chú Đơn Hàng</h2>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                rows="4"
                                placeholder="Ví dụ: Giao hàng vào buổi tối, gọi trước khi giao..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6 top-24">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tóm Tắt Đơn Hàng</h2>
                            <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
                                {(orderPreview?.items || selectedCartItems).map((item) => (
                                    <div key={item.bookId} className="flex items-center gap-4">
                                        <img
                                            src={`${import.meta.env.VITE_BOOK_SERVICE}/${item.primaryImage || 'Uploads/default-image.jpg'}`}
                                            alt={item.title}
                                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                            loading="lazy"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                                            <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                            <p className="text-blue-600 font-semibold">
                                                {item.finalPrice ? (
                                                    <>
                                                        <span className="line-through text-gray-500 mr-1">
                                                            {item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                        </span>
                                                        <span className="text-red-600">
                                                            {item.finalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-1">
                                                            ('Không áp dụng')
                                                        </span>
                                                    </>
                                                ) : (
                                                    item.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-gray-700">
                                    <span>Tổng tiền sản phẩm:</span>
                                    <span className="font-semibold">{(orderPreview?.totalAmount ?? subtotal).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-semibold">
                                        {(orderPreview?.shippingFee ?? shippingFee) === 0 ? 'Miễn phí' : (orderPreview?.shippingFee ?? shippingFee).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-900 font-bold text-lg border-t pt-2">
                                    <span>Tổng thanh toán:</span>
                                    <span className="text-blue-600">
                                        {(orderPreview?.finalAmount ?? finalAmount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Phương Thức Thanh Toán</h2>
                            <div className="space-y-3">
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={PAYMENT_METHODS.COD}
                                        checked={paymentMethod === PAYMENT_METHODS.COD}
                                        onChange={() => setPaymentMethod(PAYMENT_METHODS.COD)}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <FaMoneyBillWave className="ml-3 mr-2 text-green-500 text-xl" />
                                    <span className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition duration-200">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={PAYMENT_METHODS.VNPAY}
                                        checked={paymentMethod === PAYMENT_METHODS.VNPAY}
                                        onChange={() => setPaymentMethod(PAYMENT_METHODS.VNPAY)}
                                        className="form-radio h-5 w-5 text-blue-600"
                                    />
                                    <FaCreditCard className="ml-3 mr-2 text-blue-500 text-xl" />
                                    <span className="font-medium text-gray-800">Thanh toán VNPay (Online)</span>
                                </label>
                            </div>
                        </div>
                        <Button
                            onClick={handlePlaceOrder}
                            disabled={orderLoading || selectedCartItems.length === 0}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-lg font-semibold"
                        >
                            {orderLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
                        </Button>
                        {orderError && (
                            <p className="text-red-500 text-center mt-2 text-sm">{orderError}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;