// src/features/book/bookSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookService from '../../services/bookService'; // Đảm bảo đường dẫn đúng
import { toast } from 'react-toastify';

// Async Thunks cho các thao tác với Sách
export const getAllBooks = createAsyncThunk(
    'book/getAllBooks',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bookService.getAllBooks(params);
            console.log(response);
            return response.data; // Trả về data (chứa books và pagination)
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy danh sách sách.';
            // toast.error(errorMessage); // Toast được xử lý ở đây hoặc trong component
            return rejectWithValue(errorMessage);
        }
    }
);

export const getBookById = createAsyncThunk(
    'book/getBookById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await bookService.getBookById(id);
            return response.data.book; // Trả về object book
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể lấy thông tin sách.';
            // toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const addBook = createAsyncThunk(
    'book/addBook',
    async (bookData, { rejectWithValue }) => {
        try {
            const response = await bookService.addBook(bookData);
            return response.data.book;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể thêm sách.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateBook = createAsyncThunk(
    'book/updateBook',
    async ({ id, bookData }, { rejectWithValue }) => {
        try {
            const response = await bookService.updateBook(id, bookData);
            return response.data.book;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật sách.';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

export const deleteBook = createAsyncThunk(
    'book/deleteBook',
    async (id, { rejectWithValue }) => {
        try {
            const response = await bookService.deleteBook(id);
            return id;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Không thể xóa sách.';
            return rejectWithValue(errorMessage);
        }
    }
);

const bookSlice = createSlice({
    name: 'book',
    initialState: {
        books: [],
        selectedBook: null,
        pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 12 },
        loading: false,
        error: null,
    },
    reducers: {
        clearBookError: (state) => {
            state.error = null;
        },
        clearSelectedBook: (state) => {
            state.selectedBook = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Xử lý getAllBooks
            .addCase(getAllBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllBooks.fulfilled, (state, action) => {
                state.loading = false;
                state.books = action.payload.books;;
                state.pagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(getAllBooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.books = [];
                state.pagination = { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 };
            })

            // Xử lý getBookById
            .addCase(getBookById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedBook = null; // Reset selectedBook khi đang loading
            })
            .addCase(getBookById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBook = action.payload;
                state.error = null;
            })
            .addCase(getBookById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.selectedBook = null;
            })

            // Xử lý addBook
            .addCase(addBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addBook.fulfilled, (state, action) => {
                state.loading = false;
                state.books.push(action.payload);
                state.error = null;
            })
            .addCase(addBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Xử lý updateBook
            .addCase(updateBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBook.fulfilled, (state, action) => {
                state.loading = false;
                // Tìm và cập nhật sách trong mảng
                const index = state.books.findIndex(book => book._id === action.payload._id);
                if (index !== -1) {
                    state.books[index] = action.payload;
                }
                // Cập nhật selectedBook nếu đang xem sách đó
                if (state.selectedBook && state.selectedBook._id === action.payload._id) {
                    state.selectedBook = action.payload;
                }
                state.error = null;
            })
            .addCase(updateBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Xử lý deleteBook
            .addCase(deleteBook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBook.fulfilled, (state, action) => {
                state.loading = false;
                // Lọc bỏ sách đã xóa khỏi mảng
                state.books = state.books.filter(book => book._id !== action.payload); // action.payload là id
                // Reset selectedBook nếu sách đó bị xóa
                if (state.selectedBook && state.selectedBook._id === action.payload) {
                    state.selectedBook = null;
                }
                state.error = null;
            })
            .addCase(deleteBook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearBookError, clearSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;