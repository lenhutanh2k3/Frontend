// src/slices/author/authorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import book_service from '../../services/bookService'; // book_service chứa API cho author
import { toast } from 'react-toastify';

// Async Thunks cho các thao tác với Author
export const addAuthor = createAsyncThunk(
    'author/addAuthor',
    async (authorData, { rejectWithValue }) => {
        try {
            const response = await book_service.addAuthor(authorData); // response: { success, message, data: { author } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getAllAuthors = createAsyncThunk(
    'author/getAllAuthors',
    async (params = {}, { rejectWithValue }) => { // Thêm params để có thể có phân trang/tìm kiếm
        try {
            const response = await book_service.getAllAuthors(params); // response: { success, message, data: { authors } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getAuthorById = createAsyncThunk(
    'author/getAuthorById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await book_service.getAuthorById(id); // response: { success, message, data: { author } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateAuthor = createAsyncThunk(
    'author/updateAuthor',
    async ({ id, authorData }, { rejectWithValue }) => {
        try {
            const response = await book_service.updateAuthor(id, authorData); // response: { success, message, data: { author } }
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteAuthor = createAsyncThunk(
    'author/deleteAuthor',
    async (id, { rejectWithValue }) => {
        try {
            const response = await book_service.deleteAuthor(id); // response: { success, message }
            return { id, message: response.message }; // Trả về id và message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const authorSlice = createSlice({
    name: 'author',
    initialState: {
        authors: [],
        selectedAuthor: null,
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 },
        loading: false,
        error: null,
    },
    reducers: {
        clearAuthorError: (state) => {
            state.error = null;
        },
        clearSelectedAuthor: (state) => {
            state.selectedAuthor = null;
        },
        setSelectedAuthor: (state, action) => {
            state.selectedAuthor = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Xử lý Add Author
            .addCase(addAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAuthor.fulfilled, (state, action) => {
                state.loading = false;
                state.authors.unshift(action.payload.data.author); // ĐÃ CHỈNH SỬA: Thêm vào đầu danh sách
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(addAuthor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Get All Authors
            .addCase(getAllAuthors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllAuthors.fulfilled, (state, action) => {
                state.loading = false;
                state.authors = action.payload.data.authors;
                state.pagination =action.payload.data.pagination;
                state.error = null;
            })
            .addCase(getAllAuthors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Get Author By ID
            .addCase(getAuthorById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedAuthor = null;
            })
            .addCase(getAuthorById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAuthor = action.payload.data.author;
                state.error = null;
            })
            .addCase(getAuthorById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Update Author
            .addCase(updateAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAuthor.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.authors.findIndex(
                    (author) => author._id === action.payload.data.author._id
                );
                if (index !== -1) {
                    state.authors[index] = action.payload.data.author;
                }
                if (state.selectedAuthor && state.selectedAuthor._id === action.payload.data.author._id) {
                    state.selectedAuthor = action.payload.data.author;
                }
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(updateAuthor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            })
            // Xử lý Delete Author
            .addCase(deleteAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAuthor.fulfilled, (state, action) => {
                state.loading = false;
                state.authors = state.authors.filter(
                    (author) => author._id !== action.payload.id
                );
                if (state.selectedAuthor && state.selectedAuthor._id === action.payload.id) {
                    state.selectedAuthor = null;
                }
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(deleteAuthor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload);
            });
    },
});

export const { clearAuthorError, clearSelectedAuthor, setSelectedAuthor } = authorSlice.actions;
export default authorSlice.reducer;