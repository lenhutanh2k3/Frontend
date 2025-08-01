import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import order_service from '../../services/orderService';
import { toast } from 'react-toastify';
import { clearCart, getCart } from '../cart/cartSlice';

export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue, dispatch }) => {
        try {
            console.log("orderData", orderData);
            const response = await order_service.createOrder(orderData);
            toast.success(response.message || 'Đặt hàng thành công!');
            if (orderData.paymentMethod === 'COD') {
                dispatch(getCart());
            }
            return response.data; // { order } for COD or { orderId, orderCode, paymentId, finalAmount } for VNPay
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể đặt hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const createVnpayPaymentUrlThunk = createAsyncThunk(
    'order/createVnpayPaymentUrl',
    async ({ orderId, paymentId, amount, bankCode, language }, { rejectWithValue }) => {
        try {
            const response = await order_service.createVnpayPaymentUrl({ orderId, paymentId, amount, bankCode, language });
            return response.data; // { vnpUrl }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể tạo URL thanh toán VNPay.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const retryPayment = createAsyncThunk(
    'order/retryPayment',
    async ({ orderId, confirmCancel }, { rejectWithValue }) => {
        try {
            const response = await order_service.retryPayment(orderId, confirmCancel);
            toast.success(response.message || 'Tạo URL thanh toán mới thành công!');
            return response.data; // Should return { vnpUrl }
        } catch (error) {
            // Nếu là cảnh báo xác nhận hủy thì không hiện toast.error
            if (error?.response?.data?.shouldConfirmCancel) {
                return rejectWithValue({
                    shouldConfirmCancel: true,
                    message: error.response.data.message
                });
            }
            const errorMessage = error.response?.data?.message || 'Không thể thử lại thanh toán.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const getOrdersByUser = createAsyncThunk(
    'order/getOrdersByUser',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await order_service.getOrdersByUser(params);
            return response.data; // { orders, pagination }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy danh sách đơn hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const getOrderById = createAsyncThunk(
    'order/getOrderById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await order_service.getOrderById(id);
            return response.data.order; // { order }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy chi tiết đơn hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async (id, { rejectWithValue }) => {
        try {
            const response = await order_service.cancelOrder(id);
            return response.data.order;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể hủy đơn hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const getAllOrders = createAsyncThunk(
    'order/getAllOrders',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await order_service.getAllOrders(params);
            return response.data; // { orders, pagination }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy tất cả đơn hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateOrderStatus',
    async ({ id, newStatusData }, { rejectWithValue }) => {
        try {
            const response = await order_service.updateOrderStatus(id, newStatusData);
            return response.data.order; // { order }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        selectedOrder: null,
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        loading: false,
        error: null,
    },
    reducers: {
        clearSelectedOrder: (state) => {
            state.selectedOrder = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createVnpayPaymentUrlThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVnpayPaymentUrlThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(createVnpayPaymentUrlThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(retryPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(retryPayment.fulfilled, (state, action) => {
                state.loading = false;
                // No state change needed, the page will redirect
            })
            .addCase(retryPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getOrdersByUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrdersByUser.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders || [];
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(getOrdersByUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedOrder = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedOrder = action.payload;
                state.error = null;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = state.orders.map(order =>
                    order._id === action.payload._id ? { ...order, ...action.payload } : order
                );
                if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
                    state.selectedOrder = { ...state.selectedOrder, ...action.payload };
                }
                state.error = null;
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders || [];
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(getAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = state.orders.map(order =>
                    order._id === action.payload._id ? { ...order, ...action.payload } : order
                );
                if (state.selectedOrder && state.selectedOrder._id === action.payload._id) {
                    state.selectedOrder = { ...state.selectedOrder, ...action.payload };
                }
                state.error = null;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;