import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

// Async thunks
export const createReview = createAsyncThunk(
    'review/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await userService.createReview(reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const updateReview = createAsyncThunk(
    'review/updateReview',
    async ({ reviewId, reviewData }, { rejectWithValue }) => {
        try {
            const response = await userService.updateReview(reviewId, reviewData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'review/deleteReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            await userService.deleteReview(reviewId);
            return reviewId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const getUserReviewForBook = createAsyncThunk(
    'review/getUserReviewForBook',
    async ({ bookId, orderId }, { rejectWithValue }) => {
        try {
            const response = await userService.getUserReviewForBook(bookId, orderId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const getUserReviews = createAsyncThunk(
    'review/getUserReviews',
    async (params, { rejectWithValue }) => {
        try {
            const response = await userService.getUserReviews(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const getBookReviews = createAsyncThunk(
    'review/getBookReviews',
    async ({ bookId, params }, { rejectWithValue }) => {
        try {
            const response = await userService.getBookReviews(bookId, params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const markReviewHelpful = createAsyncThunk(
    'review/markReviewHelpful',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await userService.markReviewHelpful(reviewId);
            return { reviewId, helpfulCount: response.data.helpfulCount };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const reportReview = createAsyncThunk(
    'review/reportReview',
    async ({ reviewId, reason }, { rejectWithValue }) => {
        try {
            await userService.reportReview(reviewId, reason);
            return reviewId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

// Admin review management
export const getAllReviews = createAsyncThunk(
    'review/getAllReviews',
    async ({ params }, { rejectWithValue }) => {
        try {
            const response = await userService.getAllReviews(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const approveReview = createAsyncThunk(
    'review/approveReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await userService.approveReview(reviewId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

export const rejectReview = createAsyncThunk(
    'review/rejectReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await userService.rejectReview(reviewId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

// Admin delete review (hard delete)
export const deleteReviewAdmin = createAsyncThunk(
    'review/deleteReviewAdmin',
    async (reviewId, { rejectWithValue }) => {
        try {
            await userService.deleteReviewAdmin(reviewId);
            return reviewId;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

// Admin hide review (soft delete)
export const hideReview = createAsyncThunk(
    'review/hideReview',
    async ({ reviewId, reason }, { rejectWithValue }) => {
        try {
            const response = await userService.hideReview(reviewId, reason);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

// Admin unhide review
export const unhideReview = createAsyncThunk(
    'review/unhideReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await userService.unhideReview(reviewId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

// Admin get hidden reviews
export const getHiddenReviews = createAsyncThunk(
    'review/getHiddenReviews',
    async ({ params }, { rejectWithValue }) => {
        try {
            const response = await userService.getHiddenReviews(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

// Admin get review stats
export const getReviewStats = createAsyncThunk(
    'review/getReviewStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getReviewStats();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Có lỗi xảy ra');
        }
    }
);

const initialState = {
    // User reviews
    userReviews: [],
    userReviewsLoading: false,
    userReviewsError: null,
    userReviewsPagination: null,

    // Book reviews
    bookReviews: [],
    bookReviewsLoading: false,
    bookReviewsError: null,
    bookReviewsPagination: null,
    bookRatingStats: null,

    // Current user review for a book
    currentUserReview: null,
    currentUserReviewLoading: false,
    currentUserReviewError: null,

    // Create/Update review
    createReviewLoading: false,
    createReviewError: null,
    updateReviewLoading: false,
    updateReviewError: null,
    deleteReviewLoading: false,
    deleteReviewError: null,

    // Helpful/Report
    markHelpfulLoading: false,
    reportReviewLoading: false,

    // Admin review management
    adminReviews: [],
    adminReviewsLoading: false,
    adminReviewsError: null,
    adminReviewsPagination: null,
    approveReviewLoading: false,
    rejectReviewLoading: false,
    deleteReviewAdminLoading: false,
    hideReviewLoading: false,
    unhideReviewLoading: false,

    // Hidden reviews
    hiddenReviews: [],
    hiddenReviewsLoading: false,
    hiddenReviewsError: null,
    hiddenReviewsPagination: null,

    // Review stats
    reviewStats: null,
    reviewStatsLoading: false,
    reviewStatsError: null
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviewErrors: (state) => {
            state.createReviewError = null;
            state.updateReviewError = null;
            state.deleteReviewError = null;
            state.userReviewsError = null;
            state.bookReviewsError = null;
            state.currentUserReviewError = null;
        },
        clearCurrentUserReview: (state) => {
            state.currentUserReview = null;
        },
        clearBookReviews: (state) => {
            state.bookReviews = [];
            state.bookRatingStats = null;
        }
    },
    extraReducers: (builder) => {
        // Create review
        builder
            .addCase(createReview.pending, (state) => {
                state.createReviewLoading = true;
                state.createReviewError = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.createReviewLoading = false;
                state.currentUserReview = action.payload.review;
            })
            .addCase(createReview.rejected, (state, action) => {
                state.createReviewLoading = false;
                state.createReviewError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Update review
        builder
            .addCase(updateReview.pending, (state) => {
                state.updateReviewLoading = true;
                state.updateReviewError = null;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.updateReviewLoading = false;
                state.currentUserReview = action.payload.review;
                // Update in user reviews list
                const index = state.userReviews.findIndex(r => r._id === action.payload.review._id);
                if (index !== -1) {
                    state.userReviews[index] = action.payload.review;
                }
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.updateReviewLoading = false;
                state.updateReviewError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Delete review
        builder
            .addCase(deleteReview.pending, (state) => {
                state.deleteReviewLoading = true;
                state.deleteReviewError = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.deleteReviewLoading = false;
                state.currentUserReview = null;
                // Remove from user reviews list
                state.userReviews = state.userReviews.filter(r => r._id !== action.payload);
                // Remove from admin reviews list
                state.adminReviews = state.adminReviews.filter(r => r._id !== action.payload);
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.deleteReviewLoading = false;
                state.deleteReviewError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Get user review for book
        builder
            .addCase(getUserReviewForBook.pending, (state) => {
                state.currentUserReviewLoading = true;
                state.currentUserReviewError = null;
            })
            .addCase(getUserReviewForBook.fulfilled, (state, action) => {
                state.currentUserReviewLoading = false;
                state.currentUserReview = action.payload.review;
            })
            .addCase(getUserReviewForBook.rejected, (state, action) => {
                state.currentUserReviewLoading = false;
                state.currentUserReviewError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Get user reviews
        builder
            .addCase(getUserReviews.pending, (state) => {
                state.userReviewsLoading = true;
                state.userReviewsError = null;
            })
            .addCase(getUserReviews.fulfilled, (state, action) => {
                state.userReviewsLoading = false;
                state.userReviews = action.payload.reviews;
                state.userReviewsPagination = action.payload.pagination;
            })
            .addCase(getUserReviews.rejected, (state, action) => {
                state.userReviewsLoading = false;
                state.userReviewsError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Get book reviews
        builder
            .addCase(getBookReviews.pending, (state) => {
                state.bookReviewsLoading = true;
                state.bookReviewsError = null;
            })
            .addCase(getBookReviews.fulfilled, (state, action) => {
                state.bookReviewsLoading = false;
                state.bookReviews = action.payload.reviews;
                state.bookReviewsPagination = action.payload.pagination;
                state.bookRatingStats = action.payload.ratingDistribution;
            })
            .addCase(getBookReviews.rejected, (state, action) => {
                state.bookReviewsLoading = false;
                state.bookReviewsError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Mark review helpful
        builder
            .addCase(markReviewHelpful.pending, (state) => {
                state.markHelpfulLoading = true;
            })
            .addCase(markReviewHelpful.fulfilled, (state, action) => {
                state.markHelpfulLoading = false;
                // Update helpful count in book reviews
                const review = state.bookReviews.find(r => r._id === action.payload.reviewId);
                if (review) {
                    review.helpfulCount = action.payload.helpfulCount;
                }
            })
            .addCase(markReviewHelpful.rejected, (state) => {
                state.markHelpfulLoading = false;
            });

        // Report review
        builder
            .addCase(reportReview.pending, (state) => {
                state.reportReviewLoading = true;
            })
            .addCase(reportReview.fulfilled, (state) => {
                state.reportReviewLoading = false;
            })
            .addCase(reportReview.rejected, (state) => {
                state.reportReviewLoading = false;
            });

        // Get all reviews (admin)
        builder
            .addCase(getAllReviews.pending, (state) => {
                state.adminReviewsLoading = true;
                state.adminReviewsError = null;
            })
            .addCase(getAllReviews.fulfilled, (state, action) => {
                state.adminReviewsLoading = false;
                state.adminReviews = action.payload.reviews;
                state.adminReviewsPagination = action.payload.pagination;
            })
            .addCase(getAllReviews.rejected, (state, action) => {
                state.adminReviewsLoading = false;
                state.adminReviewsError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Approve review (admin)
        builder
            .addCase(approveReview.pending, (state) => {
                state.approveReviewLoading = true;
            })
            .addCase(approveReview.fulfilled, (state, action) => {
                state.approveReviewLoading = false;
                // Update review status in admin reviews list
                const review = state.adminReviews.find(r => r._id === action.payload.review._id);
                if (review) {
                    review.status = action.payload.review.status;
                }
            })
            .addCase(approveReview.rejected, (state) => {
                state.approveReviewLoading = false;
            });

        // Reject review (admin)
        builder
            .addCase(rejectReview.pending, (state) => {
                state.rejectReviewLoading = true;
            })
            .addCase(rejectReview.fulfilled, (state, action) => {
                state.rejectReviewLoading = false;
                // Update review status in admin reviews list
                const review = state.adminReviews.find(r => r._id === action.payload.review._id);
                if (review) {
                    review.status = action.payload.review.status;
                }
            })
            .addCase(rejectReview.rejected, (state) => {
                state.rejectReviewLoading = false;
            });

        // Delete review admin (hard delete)
        builder
            .addCase(deleteReviewAdmin.pending, (state) => {
                state.deleteReviewAdminLoading = true;
            })
            .addCase(deleteReviewAdmin.fulfilled, (state, action) => {
                state.deleteReviewAdminLoading = false;
                // Remove from admin reviews list
                state.adminReviews = state.adminReviews.filter(r => r._id !== action.payload);
            })
            .addCase(deleteReviewAdmin.rejected, (state) => {
                state.deleteReviewAdminLoading = false;
            });

        // Hide review (admin)
        builder
            .addCase(hideReview.pending, (state) => {
                state.hideReviewLoading = true;
            })
            .addCase(hideReview.fulfilled, (state, action) => {
                state.hideReviewLoading = false;
                // Update review status in admin reviews list
                const review = state.adminReviews.find(r => r._id === action.payload.review._id);
                if (review) {
                    review.isHidden = action.payload.review.isHidden;
                    review.hideReason = action.payload.review.hideReason;
                }
            })
            .addCase(hideReview.rejected, (state) => {
                state.hideReviewLoading = false;
            });

        // Unhide review (admin)
        builder
            .addCase(unhideReview.pending, (state) => {
                state.unhideReviewLoading = true;
            })
            .addCase(unhideReview.fulfilled, (state, action) => {
                state.unhideReviewLoading = false;
                // Update review status in admin reviews list
                const review = state.adminReviews.find(r => r._id === action.payload.review._id);
                if (review) {
                    review.isHidden = action.payload.review.isHidden;
                    review.hideReason = null;
                }
            })
            .addCase(unhideReview.rejected, (state) => {
                state.unhideReviewLoading = false;
            });

        // Get hidden reviews
        builder
            .addCase(getHiddenReviews.pending, (state) => {
                state.hiddenReviewsLoading = true;
                state.hiddenReviewsError = null;
            })
            .addCase(getHiddenReviews.fulfilled, (state, action) => {
                state.hiddenReviewsLoading = false;
                state.hiddenReviews = action.payload.reviews;
                state.hiddenReviewsPagination = action.payload.pagination;
            })
            .addCase(getHiddenReviews.rejected, (state, action) => {
                state.hiddenReviewsLoading = false;
                state.hiddenReviewsError = action.payload?.message || 'Có lỗi xảy ra';
            });

        // Get review stats
        builder
            .addCase(getReviewStats.pending, (state) => {
                state.reviewStatsLoading = true;
                state.reviewStatsError = null;
            })
            .addCase(getReviewStats.fulfilled, (state, action) => {
                state.reviewStatsLoading = false;
                state.reviewStats = action.payload;
            })
            .addCase(getReviewStats.rejected, (state, action) => {
                state.reviewStatsLoading = false;
                state.reviewStatsError = action.payload?.message || 'Có lỗi xảy ra';
            });
    }
});

export const { clearReviewErrors, clearCurrentUserReview, clearBookReviews } = reviewSlice.actions;
export default reviewSlice.reducer; 