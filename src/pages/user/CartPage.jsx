import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../../features/cart/cartSlice';

import { toast } from 'react-toastify';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowLeft, FaExclamationCircle, FaHeart, FaEye } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cart, totalPrice, loading, error } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [selectedItemIds, setSelectedItemIds] = useState([]);

    // Hàm tính giá sau khuyến mãi cho từng sách trong giỏ hàng
    // Bỏ hàm getDiscountedInfo

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart());
        }
    }, [dispatch, isAuthenticated]);

    useEffect(() => {
        setSelectedItemIds(prevIds => {
            const currentCartItemIds = cart?.items.map(item => item.bookId) || [];
            return prevIds.filter(id => currentCartItemIds.includes(id));
        });
    }, [cart]);

    // Chọn nguồn dữ liệu cart phù hợp
            const cartData = cart;

    // Tính tổng giá dựa trên các sản phẩm đã chọn (dùng giá sau khuyến mãi)
    const selectedItems = cartData?.items.filter(item => selectedItemIds.includes(isAuthenticated ? item.bookId : item.book._id)) || [];
    const calculatedTotalPrice = selectedItems.reduce((sum, item) => {
            const finalPrice = item.finalPrice;
    const price = item.price;
        const safePrice = (finalPrice !== undefined && finalPrice !== null) ? finalPrice : ((price !== undefined && price !== null) ? price : 0);
        return sum + (safePrice * (item.quantity || 0));
    }, 0);

    // Hàm cập nhật số lượng
    const handleQuantityChange = async (bookId, currentQuantity, newQuantity) => {
        if (newQuantity < 1) {
            toast.warn('Số lượng không thể nhỏ hơn 1.');
            return;
        }
        if (newQuantity !== currentQuantity) {
            if (isAuthenticated) {
                await dispatch(updateCartItem({ bookId, quantity: newQuantity }))
                    .unwrap()
                    .then(() => toast.success('Cập nhật số lượng thành công.'))
                    .catch((err) => {
                        toast.error(err.message || 'Không thể cập nhật số lượng.');
                        console.error("Failed to update cart item:", err);
                    });
            } else {
                dispatch(updateCartItem({ bookId, quantity: newQuantity }));
                toast.success('Cập nhật số lượng thành công.');
            }
        }
    };

    // Hàm xóa sản phẩm
    const handleRemoveItem = async (bookId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            if (isAuthenticated) {
                await dispatch(removeFromCart(bookId))
                    .unwrap()
                    .then(() => toast.success('Đã xóa sản phẩm khỏi giỏ hàng!'))
                    .catch((err) => {
                        toast.error(err.message || 'Không thể xóa sản phẩm.');
                        console.error("Failed to remove item from cart:", err);
                    });
            } else {
                dispatch(removeFromCart(bookId));
                toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
            }
        }
    };

    // Hàm xóa toàn bộ giỏ hàng
    const handleClearCart = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
            if (isAuthenticated) {
                await dispatch(clearCart())
                    .unwrap()
                    .then(() => toast.success('Xóa giỏ hàng thành công.'))
                    .catch((err) => {
                        toast.error(err.message || 'Không thể xóa giỏ hàng.');
                        console.error("Failed to clear cart:", err);
                    });
            } else {
                dispatch(clearCart());
                toast.success('Xóa giỏ hàng thành công.');
            }
        }
    };

    // Hàm chọn sản phẩm
    const handleItemSelect = (bookId) => {
        setSelectedItemIds(prev =>
            prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
        );
    };

    // Hàm chọn tất cả
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItemIds(cartData?.items.map(item => isAuthenticated ? item.bookId : item.book._id) || []);
        } else {
            setSelectedItemIds([]);
        }
    };

    const isAllSelected = cartData?.items.length > 0 && selectedItemIds.length === cartData.items.length;

    // Hàm checkout
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
            return;
        }
        if (isAuthenticated) {
            navigate('/checkout', { state: { selectedCartItems: selectedItems } });
        } else {
            navigate('/login', { state: { from: '/cart' } });
        }
    };



    if (loading && !cart) {
        return <Loading fullScreen text="Đang tải giỏ hàng..." />;
    }

    if (error && !cart) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="text-center p-8 max-w-md">
                    <FaExclamationCircle className="text-red-500 text-5xl mb-4 mx-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lỗi tải giỏ hàng</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <Button
                        onClick={() => navigate('/bookstore')}
                        icon={<FaArrowLeft />}
                    >
                        Quay lại cửa hàng
                    </Button>
                </Card>
            </div>
        );
    }

    if ((isAuthenticated && (!cart || cart.items.length === 0)) ||
        (!isAuthenticated && (!cart || cart.items.length === 0))) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="text-center p-8 max-w-md">
                    <FaShoppingCart className="text-blue-500 text-5xl mb-4 mx-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
                    <p className="text-gray-600 mb-6">Hãy thêm những cuốn sách yêu thích của bạn vào giỏ hàng!</p>
                    <Button
                        onClick={() => navigate('/bookstore')}
                        icon={<FaArrowLeft />}
                    >
                        Bắt đầu mua sắm
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/bookstore')}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Tiếp tục mua sắm
                    </button>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    <p className="text-gray-600 mt-2">Quản lý sản phẩm trong giỏ hàng</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Sản phẩm ({selectedItems.length})
                                </h2>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleClearCart}
                                    disabled={loading || cartData?.items.length === 0}
                                    icon={<FaTrash />}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>

                            {/* Select All Checkbox */}
                            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                    disabled={cartData?.items.length === 0}
                                />
                                <label htmlFor="selectAll" className="text-lg font-semibold text-gray-700">
                                    Chọn tất cả ({cartData?.items.length} sản phẩm)
                                </label>
                            </div>

                            {/* Cart Items List */}
                            <div className="space-y-4">
                                {cartData?.items.map((item) => {
                                    const bookId = item.bookId;
                                    const bookTitle = item.title;
                                    const bookImage = item.primaryImage || 'Uploads/default-image.jpg';
                                    const book = item;
                                    const finalPrice = item.finalPrice;

                                    const price = item.price;
                                    const safePrice = (finalPrice !== undefined && finalPrice !== null) ? finalPrice : ((price !== undefined && price !== null) ? price : 0);
                                    return (
                                        <div key={bookId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedItemIds.includes(bookId)}
                                                onChange={() => handleItemSelect(bookId)}
                                                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 flex-shrink-0"
                                            />
                                            {/* Product Image */}
                                            <Link to={`/bookstore/${bookId}`} className="flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border">
                                                <img
                                                    src={`${import.meta.env.VITE_BOOK_SERVICE}/${bookImage}`}
                                                    alt={bookTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            </Link>
                                            {/* Product Info */}
                                            <div className="flex-grow min-w-0">
                                                <Link to={`/bookstore/${bookId}`} className="text-lg font-semibold text-gray-800 hover:text-blue-600 line-clamp-2 transition-colors">
                                                    {bookTitle}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-green-600 font-bold text-xl">
                                                        {(safePrice * (item.quantity || 0)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                                    </span>

                                                </div>
                                                <p className="text-gray-500 text-sm">Đơn giá: {(safePrice || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                            </div>
                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(bookId, item.quantity, item.quantity - 1)}
                                                    disabled={item.quantity === 1 || loading}
                                                    className="p-2 border rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                >
                                                    <FaMinus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(bookId, item.quantity, parseInt(e.target.value, 10))}
                                                    className="w-16 px-2 py-1 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="1"
                                                    disabled={loading}
                                                />
                                                <button
                                                    onClick={() => handleQuantityChange(bookId, item.quantity, item.quantity + 1)}
                                                    disabled={loading}
                                                    className="p-2 border rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                                                >
                                                    <FaPlus size={14} />
                                                </button>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleRemoveItem(bookId)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 p-2"
                                                    disabled={loading}
                                                    title="Xóa sản phẩm"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                                <Link
                                                    to={`/bookstore/${bookId}`}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* Cart Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-8">
                            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-4 mb-6">
                                Tổng kết giỏ hàng
                            </h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-gray-700 text-lg">
                                    <span>Tổng cộng ({selectedItems.length} sản phẩm đã chọn):</span>
                                    <span className="font-bold text-green-600">
                                        {(calculatedTotalPrice || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm italic">
                                    Phí vận chuyển và thuế sẽ được tính ở bước thanh toán.
                                </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="space-y-3 flex flex-col items-center">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={loading || selectedItems.length === 0 || !isAuthenticated}
                                    fullWidth
                                    size="lg"
                                    icon={<FaShoppingCart />}
                                    className="mx-auto"
                                >
                                    Tiến hành thanh toán
                                </Button>
                                

                                
                                <Link 
                                    to="/bookstore" 
                                    className="block text-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                            
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;