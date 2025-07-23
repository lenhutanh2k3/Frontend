import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import { updateUserInState } from '../auth/authSlice';

export const getProfile = createAsyncThunk(
    'profile/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getProfile();
            return response.data.user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy thông tin hồ sơ.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData, { rejectWithValue, dispatch }) => { // Thêm dispatch vào tham số
        try {
            const response = await userService.updateProfile(profileData);
            toast.success(response.message || 'Cập nhật hồ sơ thành công!');

            // QUAN TRỌNG: Cập nhật user object trong authSlice sau khi profile được cập nhật
            dispatch(updateUserInState(response.data.user));

            return response.data.user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Cập nhật hồ sơ thất bại.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        profile: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearProfile: (state) => {
            state.profile = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;