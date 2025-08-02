import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllReviews, deleteReviewAdmin, hideReview, unhideReview } from '../../../features/review/reviewSlice';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import { toast } from 'react-toastify';
import { FaEye, FaCheck, FaTimes, FaTrash, FaStar, FaUser, FaBook } from 'react-icons/fa';

const AdminReviewsPage = () => {
    const dispatch = useDispatch();
    const { 
        adminReviews, 
        adminReviewsLoading, 
        adminReviewsError,
        adminReviewsPagination,
        deleteReviewAdminLoading
    } = useSelector(state => state.review);

    const [filters, setFilters] = useState({
        isHidden: '', // Thêm filter ẩn/hiện
        sort: 'newest',
        page: 1
    });
    useEffect(() => {
        const params = { ...filters };
        if (params.isHidden === '') {
            delete params.isHidden;
        } else {
            params.isHidden = params.isHidden === 'true';
        }
        dispatch(getAllReviews({ params }));
    }, [dispatch, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            try {
                console.log('Đang xóa đánh giá:', reviewId);
                await dispatch(deleteReviewAdmin(reviewId)).unwrap();
                console.log('Xóa đánh giá thành công');
                toast.success('Đã xóa đánh giá');
                dispatch(getAllReviews({ params: filters }));
            } catch (error) {
                console.error('Lỗi khi xóa đánh giá:', error);
                toast.error('Có lỗi xảy ra khi xóa đánh giá: ' + (error.message || 'Lỗi không xác định'));
            }
        }
    };

    const handleHideReview = async (reviewId) => {
        if (window.confirm('Bạn có chắc chắn muốn ẩn đánh giá này?')) {
            try {
                await dispatch(hideReview({ reviewId, reason: '' })).unwrap();
                toast.success('Đã ẩn đánh giá');
                dispatch(getAllReviews({ params: filters }));
            } catch (error) {
                toast.error('Có lỗi xảy ra khi ẩn đánh giá');
            }
        }
    };
    const handleUnhideReview = async (reviewId) => {
        try {
            await dispatch(unhideReview(reviewId)).unwrap();
            toast.success('Đã hiện lại đánh giá');
            dispatch(getAllReviews({ params: filters }));
        } catch (error) {
            toast.error('Có lỗi xảy ra khi hiện lại đánh giá');
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    className={`w-4 h-4 ${
                        i <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                />
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPagination = () => {
        console.log('adminReviewsPagination:', adminReviewsPagination);
        if (!adminReviewsPagination) {
            console.log('Không hiển thị pagination vì: Không có pagination');
            return null;
        }

        const { currentPage, totalPages } = adminReviewsPagination;

        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    size="sm"
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Trước
                </Button>
                
                {/* Hiển thị số trang thông minh */}
                {(() => {
                    const pages = [];
                    const totalPages = adminReviewsPagination.totalPages;
                    const current = currentPage;

                    // Luôn hiển thị trang đầu
                    pages.push(1);

                    if (totalPages <= 7) {
                        // Nếu ít trang, hiển thị tất cả
                        for (let i = 2; i <= totalPages; i++) {
                            pages.push(i);
                        }
                    } else {
                        // Nếu nhiều trang, hiển thị thông minh
                        if (current > 3) {
                            pages.push('...');
                        }

                        const start = Math.max(2, current - 1);
                        const end = Math.min(totalPages - 1, current + 1);

                        for (let i = start; i <= end; i++) {
                            if (i !== 1 && i !== totalPages) {
                                pages.push(i);
                            }
                        }

                        if (current < totalPages - 2) {
                            pages.push('...');
                        }

                        if (totalPages > 1) {
                            pages.push(totalPages);
                        }
                    }

                    return pages.map((page, index) => (
                        <div key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-2 text-gray-500">...</span>
                            ) : (
                                <Button
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 border rounded-lg ${
                                        currentPage === page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                    size="sm"
                                >
                                    {page}
                                </Button>
                            )}
                        </div>
                    ));
                })()}
                
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    size="sm"
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Sau
                </Button>
            </div>
        );
    };

    if (adminReviewsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Đang tải đánh giá...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Quản lý đánh giá
                    </h1>
                    <p className="text-gray-600">
                        Phê duyệt và quản lý tất cả đánh giá của người dùng
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            value={filters.isHidden}
                            onChange={(e) => handleFilterChange('isHidden', e.target.value)}
                            className="w-full"
                        >
                            <option value="">Tất cả</option>
                            <option value="false">Đang hiển thị</option>
                            <option value="true">Đã ẩn</option>
                        </Select>

                        <Select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="w-full"
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="rating_high">Sao cao nhất</option>
                            <option value="rating_low">Sao thấp nhất</option>
                        </Select>

                        <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-600">
                                Tổng: {adminReviewsPagination?.totalItems || 0} đánh giá
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                {adminReviewsError ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải đánh giá</p>
                        <Button
                            onClick={() => dispatch(getAllReviews({ params: filters }))}
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : adminReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <FaStar className="mx-auto h-16 w-16" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Không có đánh giá nào
                        </h3>
                        <p className="text-gray-600">
                            Chưa có đánh giá nào trong hệ thống.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {console.log('adminReviews length:', adminReviews.length)}
                        {adminReviews.map((review, index) => (
                            <div key={review._id} className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                                            {(adminReviewsPagination.currentPage - 1) * adminReviewsPagination.itemsPerPage + index + 1}
                                        </div>
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            {review.user?.profilePicture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_USER_SERVICE}${review.user.profilePicture}`}
                                                    alt={review.user.fullName}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <FaUser className="text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {review.user?.fullName || 'Người dùng'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {review.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">
                                            {formatDate(review.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="flex items-center">
                                            {renderStars(review.rating)}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {review.rating}/5 sao
                                        </span>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <div className="flex items-center space-x-1">
                                            <FaBook className="text-blue-500" />
                                            <span>{review.book?.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FaStar className="text-yellow-400" />
                                            <span>Hữu ích: {review.helpfulCount || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {/* Nút ẩn/hiện đánh giá */}
                                        {review.isHidden ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-400 text-green-700 hover:bg-green-50"
                                                onClick={() => handleUnhideReview(review._id)}
                                            >
                                                Hiện
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                                                onClick={() => handleHideReview(review._id)}
                                            >
                                                Ẩn
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {renderPagination()}
            
            </div>
        </div>
    );
};

export default AdminReviewsPage; 