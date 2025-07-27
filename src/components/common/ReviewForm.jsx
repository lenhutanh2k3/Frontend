import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createReview} from '../../features/review/reviewSlice';
import Button from './Button';
import { toast } from 'react-toastify';

const ReviewForm = ({ 
    bookId, 
    orderId, 
    existingReview = null, 
    onSuccess, 
    onCancel 
}) => {
    const dispatch = useDispatch();
    const { 
        createReviewLoading, 
        createReviewError, 
        updateReviewLoading, 
        updateReviewError 
    } = useSelector(state => state.review);

    const [formData, setFormData] = useState({
        rating: existingReview?.rating || 5,
        comment: existingReview?.comment || ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (createReviewError) {
            toast.error(createReviewError);
            dispatch(clearReviewErrors());
        }
        if (updateReviewError) {
            toast.error(updateReviewError);
            dispatch(clearReviewErrors());
        }
    }, [createReviewError, updateReviewError, dispatch]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.comment.trim()) {
            newErrors.comment = 'Vui lòng nhập nội dung nhận xét';
        }

        if (formData.comment.length > 1000) {
            newErrors.comment = 'Nội dung nhận xét không được vượt quá 1000 ký tự';
        }

        if (formData.rating < 1 || formData.rating > 5) {
            newErrors.rating = 'Rating phải từ 1 đến 5 sao';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            if (existingReview) {
                // Cập nhật đánh giá
                await dispatch(updateReview({
                    reviewId: existingReview._id,
                    reviewData: formData
                })).unwrap();
                toast.success('Cập nhật đánh giá thành công');
            } else {
                // Tạo đánh giá mới
                await dispatch(createReview({
                    bookId,
                    orderId,
                    ...formData
                })).unwrap();
                toast.success('Gửi đánh giá thành công. Đánh giá của bạn sẽ được admin phê duyệt trước khi hiển thị.');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            // Error đã được xử lý trong useEffect
        }
    };

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: '' }));
        }
    };

    const handleCommentChange = (e) => {
        const comment = e.target.value;
        setFormData(prev => ({ ...prev, comment }));
        if (errors.comment) {
            setErrors(prev => ({ ...prev, comment: '' }));
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingChange(i)}
                    className={`text-2xl transition-colors ${
                        i <= formData.rating 
                            ? 'text-yellow-400 hover:text-yellow-500' 
                            : 'text-gray-300 hover:text-gray-400'
                    }`}
                >
                    ★
                </button>
            );
        }
        return stars;
    };

    const isLoading = createReviewLoading || updateReviewLoading;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
                {existingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </h3>
            
            {/* Xóa phần lưu ý */}
            {/*
            {!existingReview && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-sm text-blue-800">
                        <strong>Lưu ý:</strong> Đánh giá của bạn sẽ được admin phê duyệt trước khi hiển thị công khai.
                    </p>
                </div>
            )}
            */}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đánh giá của bạn
                    </label>
                    <div className="flex items-center space-x-2">
                        {renderStars()}
                        <span className="text-sm text-gray-600 ml-2">
                            {formData.rating}/5 sao
                        </span>
                    </div>
                    {errors.rating && (
                        <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nhận xét của bạn
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={handleCommentChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.comment ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                        disabled={isLoading}
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.comment && (
                            <p className="text-red-500 text-sm">{errors.comment}</p>
                        )}
                        <p className={`text-sm ml-auto ${
                            formData.comment.length > 1000 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                            {formData.comment.length}/1000
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        loading={isLoading}
                    >
                        {existingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm; 