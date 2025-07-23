import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserReviews, deleteReview } from '../../features/review/reviewSlice';
import ReviewCard from '../../components/common/ReviewCard';
import ReviewForm from '../../components/common/ReviewForm';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

const ReviewManagementPage = () => {
    const dispatch = useDispatch();
    const { 
        userReviews, 
        userReviewsLoading, 
        userReviewsError,
        userReviewsPagination,
        deleteReviewLoading
    } = useSelector(state => state.review);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(getUserReviews({ page: currentPage, limit: 10 }));
    }, [dispatch, currentPage]);

    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };

    const handleDeleteReview = async (review) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            try {
                await dispatch(deleteReview(review._id)).unwrap();
                toast.success('Xóa đánh giá thành công');
                // Refresh reviews
                dispatch(getUserReviews({ page: currentPage, limit: 10 }));
            } catch (error) {
                toast.error('Có lỗi xảy ra khi xóa đánh giá');
            }
        }
    };

    const handleReviewSuccess = () => {
        setShowReviewForm(false);
        setEditingReview(null);
        // Refresh reviews
        dispatch(getUserReviews({ page: currentPage, limit: 10 }));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (!userReviewsPagination || userReviewsPagination.totalPages <= 1) return null;

        const { currentPage: page, totalPages } = userReviewsPagination;

        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    size="sm"
                >
                    Trước
                </Button>
                
                <span className="text-sm text-gray-600">
                    Trang {page} / {totalPages}
                </span>
                
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    size="sm"
                >
                    Sau
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Quản lý đánh giá
                    </h1>
                    <p className="text-gray-600">
                        Xem và quản lý tất cả đánh giá của bạn
                    </p>
                </div>

                {/* Review Form Modal */}
                {showReviewForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <ReviewForm
                                bookId={editingReview?.bookId}
                                orderId={editingReview?.orderId}
                                existingReview={editingReview}
                                onSuccess={handleReviewSuccess}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                {userReviewsLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Đang tải đánh giá...</p>
                    </div>
                ) : userReviewsError ? (
                    <div className="text-center py-12">
                        <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải đánh giá</p>
                        <Button
                            onClick={() => dispatch(getUserReviews({ page: currentPage, limit: 10 }))}
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : userReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Chưa có đánh giá nào
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Bạn chưa đánh giá sách nào. Hãy mua sách và đánh giá để chia sẻ trải nghiệm của bạn!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {userReviews.map(review => (
                            <div key={review._id} className="bg-white rounded-lg shadow-sm border p-6">
                                {review.isHidden && (
                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mb-2">
                                        Đánh giá đã bị từ chối
                                    </span>
                                )}
                                <ReviewCard
                                    review={review}
                                    showActions={true}
                                    onEdit={handleEditReview}
                                    onDelete={handleDeleteReview}
                                />
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

export default ReviewManagementPage; 