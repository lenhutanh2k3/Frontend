// src/slices/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { toast } from 'react-toastify';

// Async Thunks cho các thao tác quản lý người dùng (thường là cho Admin)

export const getUsers = createAsyncThunk(
    'user/getUsers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await userService.getUsers(params);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy danh sách người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const getUser = createAsyncThunk(
    'user/getUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await userService.getUser(id);
            return response.data.user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy thông tin người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const createUser = createAsyncThunk(
    'user/createUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userService.createUser(data); // Gọi API admin tạo user
            toast.success(response.message || 'Thêm người dùng thành công!');
            return response.data.user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể tạo người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await userService.updateUser(id, data); // Gọi API admin cập nhật user
            toast.success(response.message || 'Cập nhật người dùng thành công!');
            return response.data.user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const softDeleteUser = createAsyncThunk(
    'user/softDeleteUser',
    async ({ id, reason = null }, { rejectWithValue }) => {
        try {
            const response = await userService.softDeleteUser(id, reason);
            toast.success(response.message || 'Xóa mềm người dùng thành công!');
            return response.data.user; // Trả về user đã được cập nhật isDeleted
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa mềm người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const restoreUser = createAsyncThunk(
    'user/restoreUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await userService.restoreUser(id);
            return response.data.user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể khôi phục người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const hardDeleteUser = createAsyncThunk(
    'user/hardDeleteUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await userService.hardDeleteUser(id);
            toast.success(response.message || 'Xóa cứng người dùng thành công!');
            return id; // Trả về id để filter trong state
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa cứng người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const toggleUserActiveStatus = createAsyncThunk(
    'user/toggleUserActiveStatus',
    async ({ id, isActive, reason = null }, { rejectWithValue }) => {
        try {
            const response = await userService.toggleUserActiveStatus(id, isActive, reason);

            return response.data.user; // Trả về user đã cập nhật
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái người dùng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);


const userSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
        selectedUser: null,
        loading: false,
        error: null,
        pagination: null,
    },
    reducers: {
        clearSelectedUser: (state) => {
            state.selectedUser = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get All Users
            .addCase(getUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users || [];
                state.pagination = action.payload.pagination;
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Single User
            .addCase(getUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedUser = null;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedUser = action.payload;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create User
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                // Có thể thêm user mới vào đầu danh sách hoặc gọi lại getUsers
                state.users.unshift(action.payload); // Thêm vào đầu để thấy ngay
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                state.selectedUser = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Soft Delete User
            .addCase(softDeleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(softDeleteUser.fulfilled, (state, action) => {
                state.loading = false;
                // Cập nhật trạng thái isDeleted và isActive của user trong danh sách
                state.users = state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                if (state.selectedUser && state.selectedUser._id === action.payload._id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(softDeleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Restore User
            .addCase(restoreUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(restoreUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                if (state.selectedUser && state.selectedUser._id === action.payload._id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(restoreUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Hard Delete User
            .addCase(hardDeleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(hardDeleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(user => user._id !== action.payload);
                state.selectedUser = null;
            })
            .addCase(hardDeleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle User Active Status
            .addCase(toggleUserActiveStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleUserActiveStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.map(user =>
                    user._id === action.payload._id ? action.payload : user
                );
                if (state.selectedUser && state.selectedUser._id === action.payload._id) {
                    state.selectedUser = action.payload;
                }
            })
            .addCase(toggleUserActiveStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;