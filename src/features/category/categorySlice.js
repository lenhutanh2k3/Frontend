// src/slices/category/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import book_service from '../../services/bookService';
import { toast } from 'react-toastify';

// Async Thunks cho các thao tác với Category
export const addCategory = createAsyncThunk(
    'category/addCategory',
    async (categoryData, { rejectWithValue }) => {
        try {
            const response = await book_service.addCategory(categoryData);
            toast.success(response.message);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getAllCategories = createAsyncThunk(
    'category/getAllCategories',
    async (params = {}, { rejectWithValue }) => { // Thêm params để có thể có phân trang/lọc
        try {
            const response = await book_service.getAllCategories(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getCategoryById = createAsyncThunk(
    'category/getCategoryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await book_service.getCategoryById(id); // response: { success, message, data: { category } }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateCategory = createAsyncThunk(
    'category/updateCategory',
    async ({ id, categoryData }, { rejectWithValue }) => {
        try {
            const response = await book_service.updateCategory(id, categoryData);
            toast.success(response.message);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'category/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            const response = await book_service.deleteCategory(id);
            return { id, message: response.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const categorySlice = createSlice({
    name: 'category',
    initialState: {
        categories: [],
        selectedCategory: null,
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        loading: false,
        error: null,
    },
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        },
        clearSelectedCategory: (state) => {
            state.selectedCategory = null;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý Add Category
            .addCase(addCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories.unshift(action.payload.category);
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(addCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Get All Categories
            .addCase(getAllCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload.categories;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Get Category By ID
            .addCase(getCategoryById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedCategory = null;
            })
            .addCase(getCategoryById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCategory = action.payload.category;
                state.error = null;
            })
            .addCase(getCategoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Update Category
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.categories.findIndex(
                    (category) => category._id === action.payload.category._id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload.category;
                }
                if (state.selectedCategory && state.selectedCategory._id === action.payload.category._id) {
                    state.selectedCategory = action.payload.category;
                }
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = state.categories.filter(
                    (category) => category._id !== action.payload.id
                );
                if (state.selectedCategory && state.selectedCategory._id === action.payload.id) {
                    state.selectedCategory = null;
                }
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            });
    },
});

export const { clearCategoryError, clearSelectedCategory, setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;