// src/slices/publisher/publisherSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import book_service from '../../services/bookService'; 
import { toast } from 'react-toastify';

// Async Thunks cho các thao tác với Publisher
export const addPublisher = createAsyncThunk(
    'publisher/addPublisher',
    async (publisherData, { rejectWithValue }) => {
        try {
            const response = await book_service.addPublisher(publisherData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getAllPublishers = createAsyncThunk(
    'publisher/getAllPublishers',
    async (params = {}, { rejectWithValue }) => { // Thêm params để có thể có phân trang/tìm kiếm
        try {
            const response = await book_service.getAllPublishers(params); // response: { success, message, data: { publishers } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getPublisherById = createAsyncThunk(
    'publisher/getPublisherById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await book_service.getPublisherById(id); // response: { success, message, data: { publisher } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updatePublisher = createAsyncThunk(
    'publisher/updatePublisher',
    async ({ id, publisherData }, { rejectWithValue }) => {
        try {
            const response = await book_service.updatePublisher(id, publisherData); // response: { success, message, data: { publisher } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deletePublisher = createAsyncThunk(
    'publisher/deletePublisher',
    async (id, { rejectWithValue }) => {
        try {
            const response = await book_service.deletePublisher(id); // response: { success, message }
            // Trả về id để filter trong state và message để hiển thị toast
            return { id, message: response.message };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const publisherSlice = createSlice({
    name: 'publisher',
    initialState: {
        publishers: [],
        selectedPublisher: null,
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        loading: false,
        error: null,
    },
    reducers: {
        clearPublisherError: (state) => {
            state.error = null;
        },
        clearSelectedPublisher: (state) => {
            state.selectedPublisher = null;
        },
        setSelectedPublisher: (state, action) => {
            state.selectedPublisher = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Xử lý Add Publisher
            .addCase(addPublisher.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPublisher.fulfilled, (state, action) => {
                state.loading = false;
                state.publishers.unshift(action.payload.data.publisher); // ĐÃ CHỈNH SỬA: Thêm vào đầu danh sách
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(addPublisher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Get All Publishers
            .addCase(getAllPublishers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPublishers.fulfilled, (state, action) => {
                state.loading = false;
                state.publishers = action.payload.data.publishers;
                state.pagination= action.payload.data.pagination;
                state.error = null;
            })
            .addCase(getAllPublishers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Get Publisher By ID
            .addCase(getPublisherById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedPublisher = null;
            })
            .addCase(getPublisherById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedPublisher = action.payload.data.publisher;
                state.error = null;
            })
            .addCase(getPublisherById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Update Publisher
            .addCase(updatePublisher.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePublisher.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.publishers.findIndex(
                    (publisher) => publisher._id === action.payload.data.publisher._id
                );
                if (index !== -1) {
                    state.publishers[index] = action.payload.data.publisher;
                }
                if (state.selectedPublisher && state.selectedPublisher._id === action.payload.data.publisher._id) {
                    state.selectedPublisher = action.payload.data.publisher;
                }
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(updatePublisher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Delete Publisher
            .addCase(deletePublisher.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePublisher.fulfilled, (state, action) => {
                state.loading = false;
                state.publishers = state.publishers.filter(
                    (publisher) => publisher._id !== action.payload.id
                );
                if (state.selectedPublisher && state.selectedPublisher._id === action.payload.id) {
                    state.selectedPublisher = null;
                }
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(deletePublisher.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            });
    },
});

export const { clearPublisherError, clearSelectedPublisher, setSelectedPublisher } = publisherSlice.actions;
export default publisherSlice.reducer;