// src/slices/cart/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import order_service from '../../services/orderService';
import { toast } from 'react-toastify';

// Async Thunks cho các thao tác với Cart

// Lấy thông tin giỏ hàng của người dùng hiện tại
export const getCart = createAsyncThunk(
    'cart/getCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await order_service.getCart();
            console.log("cart", response);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể lấy giỏ hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Thêm sách vào giỏ hàng
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async (data, { rejectWithValue }) => {
        try {
            const response = await order_service.addToCart(data);
            toast.success(response.message);
            return response.data.cart;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể thêm sách vào giỏ hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Cập nhật số lượng của một sản phẩm trong giỏ hàng
export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ bookId, quantity }, { rejectWithValue }) => {
        try {
            const response = await order_service.updateCartItem(bookId, quantity); // Backend trả về { success, message, data: { cart } }
            return response.data.cart;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể cập nhật số lượng sách.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Xóa một sản phẩm khỏi giỏ hàng
export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (bookId, { rejectWithValue }) => {
        try {
            const response = await order_service.removeFromCart(bookId); // Backend trả về { success, message, data: { cart } }
            toast.success(response.message || 'Xóa sách khỏi giỏ hàng thành công!');
            return response.data.cart; // Trả về object cart đã cập nhật (hoặc có thể trả về bookId để filter)
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa sách khỏi giỏ hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

// Xóa toàn bộ giỏ hàng
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await order_service.clearCart(); // Backend trả về { success, message, data: { cart } }
            return response.data.cart;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể xóa giỏ hàng.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        cart: null,
        totalPrice: 0,
        loading: false,
        error: null,
    },
    reducers: {

        resetCartState: (state) => {
            state.cart = null;
            state.totalPrice = 0;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Xử lý getCart
            .addCase(getCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload.cart; // action.payload là data từ backend
                state.totalPrice = action.payload.totalPrice;
                state.error = null;
            })
            .addCase(getCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // action.payload là message lỗi
                state.cart = null; // Reset cart khi lỗi
                state.totalPrice = 0;
            })
            // Xử lý addToCart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload; // action.payload là object cart đã cập nhật
                // Tái tính totalPrice sử dụng finalPrice nếu có
                if (state.cart && state.cart.items) {
                    state.totalPrice = state.cart.items.reduce((sum, item) => {
                        const safePrice = (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : item.price;
                        return sum + (safePrice * item.quantity);
                    }, 0);
                }
                state.error = null;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Xử lý updateCartItem
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload; // action.payload là object cart đã cập nhật
                // Tái tính totalPrice sử dụng finalPrice nếu có
                if (state.cart && state.cart.items) {
                    state.totalPrice = state.cart.items.reduce((sum, item) => {
                        const safePrice = (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : item.price;
                        return sum + (safePrice * item.quantity);
                    }, 0);
                }
                state.error = null;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Xử lý removeFromCart
            .addCase(removeFromCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload; // action.payload là object cart đã cập nhật
                // Tái tính totalPrice sử dụng finalPrice nếu có
                if (state.cart && state.cart.items) {
                    state.totalPrice = state.cart.items.reduce((sum, item) => {
                        const safePrice = (item.finalPrice !== undefined && item.finalPrice !== null) ? item.finalPrice : item.price;
                        return sum + (safePrice * item.quantity);
                    }, 0);
                }
                state.error = null;
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Xử lý clearCart
            .addCase(clearCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload; // action.payload là object cart rỗng
                state.totalPrice = 0;
                state.error = null;
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
