// src/slices/address/addressSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { toast } from 'react-toastify';

// Async thunks cho Address (Giữ nguyên)
export const getAddresses = createAsyncThunk(
    'address/getAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getAddresses();
            return response.data.addresses;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy địa chỉ.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const createAddress = createAsyncThunk(
    'address/createAddress',
    async (data, { rejectWithValue }) => {
        try {
            const response = await userService.createAddress(data);
            toast.success(response.message || 'Thêm địa chỉ thành công!');
            return response.data.address;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể thêm địa chỉ.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateAddress = createAsyncThunk(
    'address/updateAddress',
    async ({ id, addressData }, { rejectWithValue }) => {
        try {
            const response = await userService.updateAddress(id, addressData);
            toast.success(response.message || 'Cập nhật địa chỉ thành công!');
            return response.data.address;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật địa chỉ.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        addresses: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload;
            })
            .addCase(getAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses.push(action.payload);
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = state.addresses.map(address =>
                    address._id === action.payload._id ? action.payload : address
                );
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default addressSlice.reducer;