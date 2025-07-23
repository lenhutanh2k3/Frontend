import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import { resetCartState } from '../cart/cartSlice';

export const register = createAsyncThunk(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userService.register(data);
            if (response.success) {
                toast.success(response.message || 'Đăng ký thành công!');
            } else {
                toast.error(response.message || 'Đăng ký thất bại!');
            }
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userService.login(data);
            if (response.success) {
                toast.success(response.message || 'Đăng nhập thành công!');
                return { user: response.data.user, accessToken: response.data.accessToken };
            }
            return rejectWithValue(response.message || 'Đăng nhập thất bại');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
            return rejectWithValue(errorMessage);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue, dispatch }) => { 
        try {
            const response = await userService.logout();
            dispatch(resetCartState());
            localStorage.removeItem('token');         
            return null;
        } catch (error) {
            localStorage.removeItem('token'); 
            const errorMessage = error.response?.data?.message || 'Đăng xuất thất bại';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const forgotPasswordRequest = createAsyncThunk(
    'auth/forgotPasswordRequest',
    async (email, { rejectWithValue }) => {
        try {
            const response = await userService.forgotPasswordRequest(email);
            toast.success(response.message);
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send reset email';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const verifyOtpForForgotPassword = createAsyncThunk(
    'auth/verifyOtpForForgotPassword',
    async ({ email, otp }, { rejectWithValue }) => {
        try {
            const response = await userService.verifyOtpForForgotPassword(email, otp);
            toast.success(response.message);
            return response.data.passwordChangeToken;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userService.resetPassword(data);
            toast.success(response.message || 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đặt lại mật khẩu thất bại.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const requestChangePasswordOtp = createAsyncThunk(
    'auth/requestChangePasswordOtp',
    async ({ currentPassword, newPassword, confirmNewPassword }, { rejectWithValue }) => {
        try {
            const response = await userService.requestChangePasswordOtp(currentPassword, newPassword, confirmNewPassword);
            toast.success(response.message);
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Gửi yêu cầu đổi mật khẩu thất bại.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const confirmChangePassword = createAsyncThunk(
    'auth/confirmChangePassword',
    async (otp, { rejectWithValue }) => {
        try {
            const response = await userService.confirmChangePassword(otp);
            toast.success(response.message || 'Mật khẩu đã được đổi thành công! Vui lòng đăng nhập lại.');
            return response;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: null,
        loading: false,
        passwordChangeToken: null,
        forgotPasswordEmail: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setForgotPasswordEmail: (state, action) => {
            state.forgotPasswordEmail = action.payload;
        },
        clearForgotPasswordEmail: (state) => {
            state.forgotPasswordEmail = null;
        },
        updateUserInState: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        setAccessToken: (state, action) => {
            state.accessToken = action.payload;
            state.isAuthenticated = true;
        },
        logoutSuccess: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {

                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
            })
            .addCase(forgotPasswordRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(forgotPasswordRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(forgotPasswordRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(verifyOtpForForgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.passwordChangeToken = null;
            })
            .addCase(verifyOtpForForgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.passwordChangeToken = action.payload;
            })
            .addCase(verifyOtpForForgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.passwordChangeToken = null;
                state.forgotPasswordEmail = null;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(requestChangePasswordOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestChangePasswordOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(requestChangePasswordOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(confirmChangePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(confirmChangePassword.fulfilled, (state) => {
                state.loading = false;
                state.passwordChangeToken = null;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
            })
            .addCase(confirmChangePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setForgotPasswordEmail, clearForgotPasswordEmail, updateUserInState, setAccessToken, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;