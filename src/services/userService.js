let userService = null;
const getUserService = async () => {
    if (!userService) {
        const module = await import('./api');
        const createServiceApi = module.default;
        userService = createServiceApi(import.meta.env.VITE_USER_SERVICE);
    }
    return userService;
};

const user_service = {
    register: async (data) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/register', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    login: async (data) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/login', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    logout: async () => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/logout');

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    forgotPasswordRequest: async (email) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/forgot-password/request', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    verifyOtpForForgotPassword: async (email, otp) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/forgot-password/verify-otp', { email, otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    resetPassword: async (data) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/forgot-password/reset', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    requestChangePasswordOtp: async (currentPassword, newPassword, confirmNewPassword) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/change-password/request-otp', { currentPassword, newPassword, confirmNewPassword });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    confirmChangePassword: async (otp) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/change-password/confirm', { otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    resendChangePasswordOtp: async () => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/users/change-password/resend-otp');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getProfile: async () => {
        try {
            const service = await getUserService();
            const response = await service.get('/api/users/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateProfile: async (data) => {
        try {
            const service = await getUserService();
            const response = await service.put('/api/users/profile', data, {
                headers: {
                    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('updateProfile error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Admin User Management related
    getUsers: async (params = {}) => { // Lấy danh sách users (admin)
        try {
            const service = await getUserService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/users?${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getUser: async (id) => { // Lấy thông tin user bằng ID (admin)
        try {
            const service = await getUserService();
            // Bao gồm `includeDeleted: true` để admin có thể xem user đã xóa mềm
            const response = await service.get(`/api/users/${id}?includeDeleted=true`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createUser: async (data) => { // Admin tạo user mới (sẽ gọi createUserByAdmin ở backend)
        try {
            const service = await getUserService();
            const response = await service.post('/api/users', data, {
                headers: {
                    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateUser: async (id, data) => { // Admin cập nhật user (sẽ gọi updateUserByAdmin ở backend)
        try {
            const service = await getUserService();
            const response = await service.put(`/api/users/${id}`, data, {
                headers: {
                    'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    softDeleteUser: async (id, reason = null) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/users/soft-delete/${id}`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    restoreUser: async (id) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/users/restore/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    hardDeleteUser: async (id) => {
        try {
            const service = await getUserService();
            const response = await service.delete(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // THÊM MỚI: Toggle active status cho user
    toggleUserActiveStatus: async (id, isActive, reason = null) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/users/status/${id}`, { isActive, reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // THÊM MỚI: Lấy danh sách Roles
    getRoles: async () => {
        try {
            const service = await getUserService();
            const response = await service.get('/api/users/roles');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Địa chỉ (giữ nguyên)
    getAddresses: async () => {
        try {
            const service = await getUserService();
            const response = await service.get('/api/address');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    getAddress: async (id) => {
        try {
            const service = await getUserService();
            const response = await service.get(`/api/address/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    createAddress: async (data) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/address', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateAddress: async (id, data) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/address/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Review related APIs
    createReview: async (data) => {
        try {
            const service = await getUserService();
            const response = await service.post('/api/reviews', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateReview: async (reviewId, data) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/reviews/${reviewId}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteReview: async (reviewId) => {
        try {
            const service = await getUserService();
            const response = await service.delete(`/api/reviews/${reviewId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUserReviewForBook: async (bookId, orderId) => {
        try {
            const service = await getUserService();
            const response = await service.get(`/api/reviews/user/${bookId}/${orderId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getUserReviews: async (params = {}) => {
        try {
            const service = await getUserService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/reviews/user/all?${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getBookReviews: async (bookId, params = {}) => {
        try {
            const service = await getUserService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/reviews/book/${bookId}?${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    markReviewHelpful: async (reviewId) => {
        try {
            const service = await getUserService();
            const response = await service.post(`/api/reviews/${reviewId}/helpful`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    reportReview: async (reviewId, reason) => {
        try {
            const service = await getUserService();
            const response = await service.post(`/api/reviews/${reviewId}/report`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Admin review management APIs
    getAllReviews: async (params = {}) => {
        try {
            const service = await getUserService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/reviews/admin/all?${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    approveReview: async (reviewId) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/reviews/admin/${reviewId}/approve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    rejectReview: async (reviewId) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/reviews/admin/${reviewId}/reject`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Admin delete review (hard delete)
    deleteReviewAdmin: async (reviewId) => {
        try {
            console.log('Calling deleteReviewAdmin API with reviewId:', reviewId);
            const service = await getUserService();
            const response = await service.delete(`/api/reviews/admin/${reviewId}`);
            console.log('deleteReviewAdmin API response:', response);
            return response.data;
        } catch (error) {
            console.error('deleteReviewAdmin API error:', error);
            throw error;
        }
    },

    // Admin hide review (soft delete)
    hideReview: async (reviewId, reason) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/reviews/admin/${reviewId}/hide`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Admin unhide review
    unhideReview: async (reviewId) => {
        try {
            const service = await getUserService();
            const response = await service.put(`/api/reviews/admin/${reviewId}/unhide`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Admin get hidden reviews
    getHiddenReviews: async (params = {}) => {
        try {
            const service = await getUserService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/reviews/admin/hidden?${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },


};

export default user_service;