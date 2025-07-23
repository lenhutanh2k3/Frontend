import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBell, FaShoppingCart, FaUserCircle, FaBars, FaSignOutAlt, FaSearch, FaTimes, FaAngleDown, FaSpinner, FaBook, FaHome, FaHeart, FaUser, FaStar, FaClipboardList, FaTag } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

import { clearCart } from '../../features/cart/cartSlice';
import { getAllCategories } from '../../features/category/categorySlice';
import { getCart } from '../../features/cart/cartSlice';
import Button from './Button';
import Input from './Input';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy state từ Redux
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const { categories, loading: categoriesLoading, error: categoriesError } = useSelector((state) => state.category);
    const { cart, loading: cartLoading, error: cartError } = useSelector((state) => state.cart);
    console.log("user", user);
    // State cho việc mở/đóng menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Thêm state cho ô tìm kiếm
    const [isScrolled, setIsScrolled] = useState(false);

    // Ref cho việc đóng menu khi click ra ngoài
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const categoryButtonRef = useRef(null); // Ref cho nút "Tất cả danh mục"

    // Fetch categories khi component mount
    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    // Fetch cart khi user authenticated
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart());
        }
    }, [dispatch, isAuthenticated]);

    // Đóng mobile menu khi trạng thái xác thực thay đổi (đăng nhập/đăng xuất)
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [isAuthenticated]);

    // Xử lý click ra ngoài để đóng menu
    const handleClickOutside = useCallback((event) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
            setIsUserMenuOpen(false);
        }
        // Logic cho mobile menu: Đóng nếu click ra ngoài menu và không phải click vào nút mở menu
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isMobileMenuOpen) {
            // Kiểm tra xem click có phải từ nút mở mobile menu không
            const isToggleButton = event.target.closest('.lg\\:hidden > button');
            if (!isToggleButton) {
                setIsMobileMenuOpen(false);
            }
        }
        // Logic cho category menu: Đóng nếu click ra ngoài menu và không phải click vào nút mở menu
        if (categoryButtonRef.current && !categoryButtonRef.current.contains(event.target) && isCategoryMenuOpen) {
            const isCategoryMenuItem = event.target.closest('.category-dropdown a');
            if (!isCategoryMenuItem) {
                setIsCategoryMenuOpen(false);
            }
        }
    }, [isMobileMenuOpen, isCategoryMenuOpen]); // Thêm isCategoryMenuOpen vào dependencies

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]); // Dependency là handleClickOutside để tránh tạo lại listener

    // Toggle functions
    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen((prev) => !prev);
        // Khi mở/đóng menu mobile, đảm bảo các menu con khác đóng
        if (!isMobileMenuOpen) {
            setIsCategoryMenuOpen(false);
            setIsUserMenuOpen(false);
        }
    }, [isMobileMenuOpen]);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    const toggleCategoryMenu = useCallback(() => {
        setIsCategoryMenuOpen((prev) => !prev);
    }, []);

    const toggleUserMenu = useCallback(() => {
        setIsUserMenuOpen((prev) => !prev);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await dispatch(logout()).unwrap();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
        closeMobileMenu();
        setIsUserMenuOpen(false);
    }, [dispatch, navigate, closeMobileMenu]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/bookstore?q=${encodeURIComponent(searchQuery.trim())}`);
            closeMobileMenu(); // Đóng menu mobile sau khi tìm kiếm
        }
    };

    // Lấy URL ảnh profile
    const profilePictureUrl = user?.profilePicture
        ? `${import.meta.env.VITE_USER_SERVICE}${user.profilePicture}`
        : null;

    // Lấy số lượng sản phẩm trong giỏ hàng
    const cartItemCount = cart?.items?.length || 0;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    const currentUser = user;

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-slide-in-top ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <FaBook className="text-white text-sm lg:text-base" />
                        </div>
                        <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            BookStore
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        <Link
                            to="/"
                            className={`text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 ${location.pathname === '/' ? 'text-blue-600 bg-blue-50' : ''
                                }`}
                        >
                            <FaHome className="inline mr-2" />
                            Trang chủ
                        </Link>
                        <Link
                            to="/bookstore"
                            className={`text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 ${location.pathname.startsWith('/bookstore') ? 'text-blue-600 bg-blue-50' : ''
                                }`}
                        >
                            <FaBook className="inline mr-2" />
                            Cửa hàng
                        </Link>
                    </nav>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-4">
                        <form onSubmit={handleSearchSubmit} className="w-full">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm sách..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={<FaSearch />}
                                className="w-full"
                            />
                        </form>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-3">
                        {/* Đơn hàng - chỉ hiện khi đã đăng nhập */}
                        {currentUser && (
                            <Link
                                to={isAuthenticated ? "/orders" : "/order-history"}
                                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                            >
                                <FaClipboardList className="text-xl" />
                            </Link>
                        )}
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                        >
                            <FaShoppingCart className="text-xl" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {currentUser ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {profilePictureUrl ? (
                                        <img
                                            src={profilePictureUrl}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <FaUser className="text-white text-sm" />
                                        </div>
                                    )}
                                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                                        {currentUser.fullName || currentUser.email}
                                    </span>



                                </button>

                                {/* User Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                        {isAuthenticated ? (
                                            <>
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaUser className="inline mr-2" />
                                                    Hồ sơ
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaClipboardList className="inline mr-2" />
                                                    Đơn hàng
                                                </Link>
                                                <Link
                                                    to="/reviews"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaStar className="inline mr-2" />
                                                    Đánh giá
                                                </Link>
                                                <hr className="my-2" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <FaSignOutAlt className="inline mr-2" />
                                                    Đăng xuất
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                
                                                <Link
                                                    to="/order-history"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <FaClipboardList className="inline mr-2" />
                                                    Đơn hàng
                                                </Link>
                                                <hr className="my-2" />
                                                <Link
                                                    to="/login"
                                                    className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                                >
                                                    Đăng ký tài khoản
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <FaSignOutAlt className="inline mr-2" />
                                                    Xóa thông tin
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                >
                                    Đăng nhập
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                >
                                    Đăng ký
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors touch-target"
                        >
                            {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-4">
                    <form onSubmit={handleSearchSubmit}>
                        <Input
                            type="text"
                            placeholder="Tìm kiếm sách..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<FaSearch />}
                            className="w-full"
                            clearable={true}
                            onClear={() => setSearchQuery('')}
                        />
                    </form>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 py-4 bg-white">
                        <nav className="flex flex-col space-y-1">
                            <Link
                                to="/"
                                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${location.pathname === '/'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={closeMobileMenu}
                            >
                                <FaHome className="mr-3" />
                                Trang chủ
                            </Link>
                            <Link
                                to="/bookstore"
                                className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center ${location.pathname.startsWith('/bookstore')
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                onClick={closeMobileMenu}
                            >
                                <FaBook className="mr-3" />
                                Cửa hàng
                            </Link>
                        
                            {currentUser && (
                                <Link
                                    to={isAuthenticated ? "/orders" : "/order-history"}
                                    className="px-4 py-3 rounded-lg font-medium transition-colors flex items-center text-gray-700 hover:bg-gray-100"
                                    onClick={closeMobileMenu}
                                >
                                    <FaClipboardList className="mr-3" />
                                    Đơn hàng
                                </Link>
                            )}
                            {!currentUser && (
                                <div className="px-4 py-3 space-y-3">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        onClick={() => {
                                            navigate('/login');
                                            closeMobileMenu();
                                        }}
                                    >
                                        Đăng nhập
                                    </Button>
                                    <Button
                                        fullWidth
                                        onClick={() => {
                                            navigate('/register');
                                            closeMobileMenu();
                                        }}
                                    >
                                        Đăng ký
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;