// src/components/products/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaEye } from 'react-icons/fa';

const ProductCard = React.memo(({ product, loading = false, className = '', onAddToCart, onQuickView, actions, ...props }) => {
    if (loading) {
        // Skeleton loading
        return (
            <div className={`bg-white rounded-lg shadow-md overflow-hidden animate-pulse ${className}`} {...props}>
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-4 pt-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                </div>
                <div className="h-10 bg-gray-100" />
            </div>
        );
    }
    if (!product) return null;
    const { id, image, title, price, originalPrice, discount } = product;
    const formatPrice = (p) => {
        if (!p) return '';
        const numericPrice = parseFloat(p.replace(/[^\d]/g, ''));
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericPrice);
    };
    return (
        <div
            className={`group bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative ${className}`}
            {...props}
        >
            {discount && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold z-10 animate-bounce-short">
                    {discount}
                </span>
            )}
            <Link to={`/products/${id}`} className="block" tabIndex={0} aria-label={`Xem chi tiết sách ${title}`}> 
                <div className="w-full h-48 overflow-hidden flex items-center justify-center p-2">
                    <img src={image} alt={title} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4 pt-2">
                    <p className="font-semibold text-gray-800 text-base h-12 overflow-hidden mb-1 leading-tight group-hover:text-orange-600 transition-colors duration-200">
                        {title}
                    </p>
                    <div className="flex items-baseline mb-2 mt-2">
                        <p className="text-orange-600 font-bold text-lg mr-2">{formatPrice(price)}</p>
                        {originalPrice && (
                            <p className="text-gray-500 text-sm line-through">{formatPrice(originalPrice)}</p>
                        )}
                    </div>
                </div>
            </Link>
            {/* Overlay buttons for hover effect */}
            <div className="absolute inset-x-0 bottom-0 bg-white bg-opacity-90 p-2 flex justify-center space-x-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                {actions ? (
                    actions
                ) : (
                    <>
                        <button
                            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors duration-200"
                            title="Thêm vào giỏ hàng"
                            aria-label="Thêm vào giỏ hàng"
                            onClick={onAddToCart}
                        >
                            <FaShoppingCart />
                        </button>
                        <button
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
                            title="Xem nhanh"
                            aria-label="Xem nhanh"
                            onClick={onQuickView}
                        >
                            <FaEye />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
});

export default ProductCard;