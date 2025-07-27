import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    getBookReviews, 
    getUserReviewForBook, 
    clearBookReviews,
    clearCurrentUserReview 
} from '../../features/review/reviewSlice';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';
import Button from './Button';
import Select from './Select';

const ReviewSection = ({ bookId, orderId, bookRating, refetchBook }) => {
    const dispatch = useDispatch();
    const { 
        bookReviews, 
        bookReviewsLoading, 
        bookReviewsError,
        bookReviewsPagination,
        bookRatingStats,
        currentUserReview,
        currentUserReviewLoading,
    } = useSelector(state => state.review);
    const { user } = useSelector(state => state.auth);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [filters, setFilters] = useState({
        rating: '',
        sort: 'newest',
        page: 1
    });

    useEffect(() => {
        if (bookId) {
            dispatch(getBookReviews({ bookId, params: filters }));
        }
    }, [dispatch, bookId, filters]);

    useEffect(() => {
        if (bookId && orderId && user) {
            dispatch(getUserReviewForBook({ bookId, orderId }));
        }
    }, [dispatch, bookId, orderId, user]);

    useEffect(() => {
        return () => {
            dispatch(clearBookReviews());
            dispatch(clearCurrentUserReview());
        };
    }, [dispatch]);

    const handleCreateReview = () => {
        setEditingReview(null);
        setShowReviewForm(true);
    };

    const handleReviewSuccess = () => {
        setShowReviewForm(false);
        setEditingReview(null);
        // Refresh reviews
        dispatch(getBookReviews({ bookId, params: filters }));
        if (orderId) {
            dispatch(getUserReviewForBook({ bookId, orderId }));
        }
        // Gọi refetchBook nếu có để cập nhật lại rating trung bình
        if (typeof refetchBook === 'function') {
            refetchBook();
        }
    };

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

    const renderRatingStats = () => {
        if (!bookRating) return null;
        // Lấy trực tiếp từ bookRating thay vì tính lại từ bookRatingStats
        return (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Thống kê đánh giá</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {bookRating?.rating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="text-sm text-gray-600">Trung bình</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {bookRating?.reviewCount || 0}
                            </div>
                            <div className="text-sm text-gray-600">Đánh giá</div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {[5, 4, 3, 2, 1].map(rating => {
                            const count = bookRatingStats ? (bookRatingStats[rating] || 0) : 0;
                            const totalReviews = bookRating?.reviewCount || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600 w-4">{rating}★</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-8">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderFilters = () => (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                className="w-full sm:w-32"
            >
                <option value="">Tất cả sao</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
            </Select>

            <Select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full sm:w-40"
            >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="rating_high">Sao cao nhất</option>
                <option value="rating_low">Sao thấp nhất</option>
                <option value="helpful">Hữu ích nhất</option>
            </Select>

            {user && orderId && !currentUserReview && (
                <Button
                    onClick={handleCreateReview}
                    className="w-full sm:w-auto"
                >
                    Viết đánh giá
                </Button>
            )}
            
            {user && orderId && currentUserReview && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                        <strong>Đánh giá của bạn đang chờ phê duyệt.</strong> Admin sẽ xem xét và phê duyệt đánh giá của bạn sớm nhất có thể.
                    </p>
                </div>
            )}
        </div>
    );

    const renderPagination = () => {
        if (!bookReviewsPagination || bookReviewsPagination.totalPages <= 1) return null;

        const { currentPage, totalPages } = bookReviewsPagination;

        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    size="sm"
                >
                    Trước
                </Button>
                
                <span className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                </span>
                
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    size="sm"
                >
                    Sau
                </Button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                    Đánh giá từ khách hàng
                </h3>
                {currentUserReview && (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            Chỉnh sửa đánh giá
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteReview(currentUserReview)}
                            disabled={deleteReviewLoading}
                        >
                            Xóa đánh giá
                        </Button>
                    </div>
                )}
            </div>

            {/* Rating Stats */}
            {renderRatingStats()}

            {/* Filters */}
            {renderFilters()}

            {/* Review Form */}
            {showReviewForm && (
                <ReviewForm
                    bookId={bookId}
                    orderId={orderId}
                    existingReview={editingReview}
                    onSuccess={handleReviewSuccess}
                    onCancel={() => setShowReviewForm(false)}
                />
            )}

            {/* Current User Review */}
            {currentUserReview && !showReviewForm && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Đánh giá của bạn</h4>
                    <ReviewCard
                        review={currentUserReview}
                        showActions={false}
                    />
                </div>
            )}

            {/* Reviews List */}
            {bookReviewsLoading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Đang tải đánh giá...</p>
                </div>
            ) : bookReviewsError ? (
                <div className="text-center py-8">
                    <p className="text-red-600">Có lỗi xảy ra khi tải đánh giá</p>
                </div>
            ) : (bookReviews.length === 0 && !currentUserReview) ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Chưa có đánh giá nào cho sách này</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookReviews
                        .filter(review => currentUserReview ? review._id !== currentUserReview._id : true)
                        .map(review => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {renderPagination()}
        </div>
    );
};

export default ReviewSection; 