import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { markReviewHelpful } from '../../features/review/reviewSlice';
import { FaThumbsUp } from 'react-icons/fa';

const ReviewCard = ({ review, showActions = true, onEdit, onDelete }) => {
    const dispatch = useDispatch();
    const { markHelpfulLoading, reportReviewLoading } = useSelector(state => state.review);
    const { user } = useSelector(state => state.auth);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`text-sm ${
                        i <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isCurrentUserReview = user && review.user?._id === user.id;

    // Xóa hoàn toàn getStatusBadge, trạng thái review.status khỏi UI
    // Xác định user đã bấm hữu ích chưa (giả sử review.helpfulUsers là mảng userId)
    const isHelpful = user && review.helpfulUsers && review.helpfulUsers.includes(user.id);
    const handleMarkHelpful = () => {
        if (!user) {
            toast.info('Bạn cần đăng nhập để đánh giá hữu ích.');
            return;
        }
        if (isHelpful) {
            toast.info('Bạn đã đánh giá hữu ích cho nhận xét này.');
            return;
        }
        dispatch(markReviewHelpful(review._id));
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {review.user?.profilePicture ? (
                                <img
                                    src={
                                        review.user.profilePicture.startsWith('http')
                                            ? review.user.profilePicture
                                            : `${import.meta.env.VITE_USER_SERVICE}${review.user.profilePicture}`
                                    }
                                    alt={review.user.fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-600 font-semibold">
                                    {review.user?.fullName?.charAt(0) || 'U'}
                                </span>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {review.user?.fullName || 'Người dùng'}
                            </p>
                            <div className="flex items-center space-x-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-500">
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="flex items-center space-x-2">
                            {isCurrentUserReview && (
                                <>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(review)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Chỉnh sửa
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(review)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div>
                    {review.book && (
                        <div className="mb-2">
                            <p className="text-sm text-blue-600 font-medium">
                                {review.book.title}
                            </p>
                        </div>
                    )}
                    <p className="text-gray-800 leading-relaxed">
                        {review.comment}
                    </p>
                </div>

                {/* Footer */}
                {showActions && (
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-4">
                            <button
                                className={`flex items-center text-sm text-gray-600 hover:text-blue-600 focus:outline-none ${isHelpful ? 'font-bold text-blue-600' : ''}`}
                                onClick={handleMarkHelpful}
                                disabled={markHelpfulLoading || isHelpful}
                                title={isHelpful ? 'Bạn đã đánh giá hữu ích' : 'Đánh giá này hữu ích'}
                            >
                                <FaThumbsUp className="mr-1" />
                                Hữu ích
                                <span className="ml-1">{review.helpfulCount || 0}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ReviewCard; 