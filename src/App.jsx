import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/user/Home';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import ForgotPasswordPage from './pages/user/ForgotPasswordPage';
import ConfirmResetPasswordPage from './pages/user/ConfirmResetPasswordPage';
import ProfilePage from './pages/user/ProfilePage';
import AddressManagementPage from './pages/user/AddressManagementPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';
import VerifyOtpPage from './pages/user/VerifyOtpPage';
import VerifyChangePasswordOtpPage from './pages/user/VerifyChangePasswordOtpPage';
import ConfirmChangePasswordPage from './pages/user/ConfirmChangePasswordPage';
import BookStorePage from './pages/user/BookStorePage';
import BookDetailPage from './pages/user/BookDetailPage';
import CartPage from './pages/user/CartPage';
import CheckoutPage from './pages/user/CheckoutPage';
import OrderSuccessPage from './pages/user/OrderSuccessPage';
import PaymentErrorPage from './pages/user/PaymentErrorPage';
import OrderHistoryPage from './pages/user/OrderHistoryPage';
import OrderDetailPage from './pages/user/OrderDetailPage';
import ReviewManagementPage from './pages/user/ReviewManagementPage';
import NotFoundPage from './pages/NotFoundPage';

// Import các component Admin đã được uncomment và cải thiện
import AdminLayout from './layouts/AdminLayout'; // Đảm bảo bạn có file này
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';


import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute'; // AdminRoute đã được sửa đổi
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// //Author - Uncomment nếu bạn đã có các component này
import AdminAuthorsPage from './pages/admin/author/AdminAuthorsPage';
import AdminEditAuthorPage from './pages/admin/author/AdminEditAuthorPage';
import AdminCreateAuthorPage from './pages/admin/author/AdminCreateAuthorPage';

// //Categories - Uncomment nếu bạn đã có các component này
import AdminCreateCategoryPage from './pages/admin/category/AdminCreateCategoryPage';
import AdminCategoriesPage from './pages/admin/category/AdminCategoriesPage';
import AdminEditCategoryPage from './pages/admin/category/AdminEditCategoryPage';

// //Publisher - Uncomment nếu bạn đã có các component này
import  AdminPublishersPage from './pages/admin/publisher/AdminPublishersPage';
import AdminCreatePublisherPage from './pages/admin/publisher/AdminCreatePublisherPage';
import AdminEditPublisherPage from './pages/admin/publisher/AdminEditPublisherPage';

//Books
import AdminBooksPage from './pages/admin/book/AdminBooksPage';
import AdminCreateBookPage from './pages/admin/book/AdminCreateBookPage';
import AdminEditBookPage from './pages/admin/book/AdminEditBookPage';

//User
import AdminUsersPage from './pages/admin/user/AdminUsersPage';
import AdminCreateUserPage from './pages/admin/user/AdminCreateUserPage';
import AdminEditUserPage from './pages/admin/user/AdminEditUserPage';

//order
import AdminOrderListPage from './pages/admin/order/AdminOrderListPage';
import AdminOrderDetailPage from './pages/admin/order/AdminOrderDetailPage';

// Review management
import AdminReviewsPage from './pages/admin/review/AdminReviewsPage';

const App = () => {
    return (
        <>
            <Routes>
                {/* User routes with MainLayout */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-otp" element={<VerifyOtpPage />} />
                    <Route path="/reset-password-confirm" element={<ConfirmResetPasswordPage />} />
                    <Route path="/bookstore" element={<BookStorePage />} />
                    <Route path="/bookstore/:id" element={<BookDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
        

                    {/* Protected user routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/addresses" element={<AddressManagementPage />} />
                        <Route path="/change-password" element={<ChangePasswordPage />} />
                        <Route path="/verify-change-password-otp" element={<VerifyChangePasswordOtpPage />} />
                        <Route path="/confirm-change-password" element={<ConfirmChangePasswordPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route path="/payment/error" element={<PaymentErrorPage />} />
                        <Route path="/orders" element={<OrderHistoryPage />} />
                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/reviews" element={<ReviewManagementPage />} />
                    </Route>
                </Route>

                {/* Admin routes - Protected by AdminRoute */}
                {/* Admin login không cần bảo vệ, nên đặt ngoài AdminRoute */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        {/* User Management Routes */}
                        <Route path="users/create" element={<AdminCreateUserPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="users/edit/:id" element={<AdminEditUserPage />} />

                        {/* Authors Routes - Uncomment khi sẵn sàng */}
                        <Route path="authors" element={<AdminAuthorsPage />} />
                        <Route path="authors/create" element={<AdminCreateAuthorPage />} />
                        <Route path="authors/edit/:id" element={<AdminEditAuthorPage />} />

                        {/* Categories Routes - Uncomment khi sẵn sàng */}
                        <Route path="categories" element={<AdminCategoriesPage />} />
                        <Route path="categories/create" element={<AdminCreateCategoryPage />} />
                        <Route path="categories/edit/:id" element={<AdminEditCategoryPage />} />

                        {/* Publisher Routes - Uncomment khi sẵn sàng */}
                        <Route path="publishers" element={<AdminPublishersPage />} />
                        <Route path="publishers/create" element={<AdminCreatePublisherPage />} />
                        <Route path="publishers/edit/:id" element={<AdminEditPublisherPage />} />

                        <Route path="books" element={<AdminBooksPage />} />
                        <Route path="books/create" element={<AdminCreateBookPage />} />
                        <Route path="books/edit/:id" element={<AdminEditBookPage />} />

                        <Route path="/admin/orders" element={<AdminOrderListPage />} />
                        <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />


                        {/* Review Management Routes */}
                        <Route path="reviews" element={<AdminReviewsPage />} />



                    </Route>
                </Route>

                {/* Route 404 Not Found - phải nằm cuối cùng */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
};

export default App;
