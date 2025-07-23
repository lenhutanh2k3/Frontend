// src/routes/AdminRoute.jsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminRoute = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    // Nếu chưa đăng nhập, chuyển hướng về trang login admin
    if (!isAuthenticated) {
        toast.warn('Bạn cần đăng nhập để truy cập trang quản trị.');
        return <Navigate to="/admin/login" replace />;
    }


    if (user && user.role && user.role.name === 'admin') {
        return <Outlet />;
    }


    toast.error('Bạn không có quyền truy cập trang quản trị này.');
    return <Navigate to="/" replace />;
};

export default AdminRoute;