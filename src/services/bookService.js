// src/services/bookService.js
let bookService = null;
const getBookService = async () => {
    if (!bookService) {
        const module = await import('./api');
        const createServiceApi = module.default;
        bookService = createServiceApi(import.meta.env.VITE_BOOK_SERVICE || 'http://localhost:8000');
    }
    return bookService;
};
const book_service = {
    getAllBooks: async (params = {}) => {
        try {
            const service = await getBookService();
            const queryString = new URLSearchParams(params).toString();
            console.log(queryString);
            // Backend: GET /api/books
            const response = await service.get(`/api/books?${queryString}`);
            console.log("reponse", response.data);
            return response.data; // Trả về { success, message, data: { books, pagination } }
        } catch (error) {
            throw error;
        }
    },
    getBookById: async (id) => {
        try {
            const service = await getBookService();
            // Backend: GET /api/books/:id
            const response = await service.get(`/api/books/${id}`);
            return response.data; // Trả về { success, message, data: { book } }
        } catch (error) {
            throw error;
        }
    },
    addBook: async (data) => {
        try {
            const service = await getBookService();
            const response = await service.post('/api/books', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data; // Trả về { success, message, data: { book } }
        } catch (error) {
            throw error;
        }
    },
    updateBook: async (id, data) => {
        try {
            const service = await getBookService();
            // Backend: PUT /api/books/:id (Middleware checkAdminRole)
            const response = await service.put(`/api/books/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data; // Trả về { success, message, data: { book } }
        } catch (error) {
            throw error;
        }
    },
    updateBookStock: async (id, quantity) => {
        try {
            const service = await getBookService();
            // Backend: PUT /api/books/:id/stock
            const response = await service.put(`/api/books/${id}/stock`, { quantity });
            return response.data; // Trả về { success, message, data: { book } }
        } catch (error) {
            throw error;
        }
    },
    deleteBook: async (id) => {
        try {
            const service = await getBookService();
            // Backend: DELETE /api/books/:id (Middleware checkAdminRole)
            const response = await service.delete(`/api/books/${id}`);
            return response.data; // Trả về { success, message }
        } catch (error) {
            throw error;
        }
    },
    restoreBook: async (id) => {
        try {
            const service = await getBookService();
            // Backend: PUT /api/books/:id/restore
            const response = await service.put(`/api/books/${id}/restore`);
            return response.data; // Trả về { success, message, data: { book } }
        } catch (error) {
            throw error;
        }
    },

    // Category Service API
    getAllCategories: async (params = {}) => {
        try {
            const service = await getBookService();
            const queryString = new URLSearchParams(params).toString();
            // Backend: GET /api/categories
            const response = await service.get(`/api/categories?${queryString}`);
            return response.data; // Trả về { success, message, data: { categories } }
        } catch (error) {
            throw error;
        }
    },
    getCategoryById: async (id) => {
        try {
            const service = await getBookService();
            // Backend: GET /api/categories/:id
            const response = await service.get(`/api/categories/${id}`);
            return response.data; // Trả về { success, message, data: { category } }
        } catch (error) {
            throw error;
        }
    },
    addCategory: async (data) => {
        try {
            const service = await getBookService();
            // Backend: POST /api/categories (Middleware checkAdminRole)
            const response = await service.post('/api/categories', data);
            return response.data; // Trả về { success, message, data: { category } }
        } catch (error) {
            throw error;
        }
    },
    updateCategory: async (id, data) => {
        try {
            const service = await getBookService();
            // Backend: PUT /api/categories/:id (Middleware checkAdminRole)
            const response = await service.put(`/api/categories/${id}`, data);
            return response.data; // Trả về { success, message, data: { category } }
        } catch (error) {
            throw error;
        }
    },
    deleteCategory: async (id) => {
        try {
            const service = await getBookService();
            // Backend: DELETE /api/categories/:id (Middleware checkAdminRole)
            const response = await service.delete(`/api/categories/${id}`);
            return response.data; // Trả về { success, message }
        } catch (error) {
            throw error;
        }
    },

    // Author Service API
    getAllAuthors: async (params = {}) => {
        try {
            const service = await getBookService();
            const queryString = new URLSearchParams(params).toString();
            // Backend: GET /api/authors
            const response = await service.get(`/api/authors?${queryString}`);
            return response.data; // Trả về { success, message, data: { authors } }
        } catch (error) {
            throw error;
        }
    },
    getAuthorById: async (id) => {
        try {
            const service = await getBookService();
            // Backend: GET /api/authors/:id
            const response = await service.get(`/api/authors/${id}`);
            return response.data; // Trả về { success, message, data: { author } }
        } catch (error) {
            throw error;
        }
    },
    addAuthor: async (data) => {
        try {
            const service = await getBookService();
            // Backend: POST /api/authors (Middleware checkAdminRole)
            const response = await service.post('/api/authors', data);
            return response.data; // Trả về { success, message, data: { author } }
        } catch (error) {
            throw error;
        }
    },
    updateAuthor: async (id, data) => {
        try {
            const service = await getBookService();
            // Backend: PUT /api/authors/:id (Middleware checkAdminRole)
            const response = await service.put(`/api/authors/${id}`, data);
            return response.data; // Trả về { success, message, data: { author } }
        } catch (error) {
            throw error;
        }
    },
    deleteAuthor: async (id) => {
        try {
            const service = await getBookService();
            // Backend: DELETE /api/authors/:id (Middleware checkAdminRole)
            const response = await service.delete(`/api/authors/${id}`);
            return response.data; // Trả về { success, message }
        } catch (error) {
            throw error;
        }
    },

    // Publisher Service API
    getAllPublishers: async (params = {}) => {
        try {
            const service = await getBookService();
            const queryString = new URLSearchParams(params).toString();
            // Backend: GET /api/publishers
            const response = await service.get(`/api/publishers?${queryString}`);
            return response.data; // Trả về { success, message, data: { publishers } }
        } catch (error) {
            throw error;
        }
    },
    getPublisherById: async (id) => {
        try {
            const service = await getBookService();
            // Backend: GET /api/publishers/:id
            const response = await service.get(`/api/publishers/${id}`);
            return response.data; // Trả về { success, message, data: { publisher } }
        } catch (error) {
            throw error;
        }
    },
    addPublisher: async (data) => {
        try {
            const service = await getBookService();
            // Backend: POST /api/publishers (Middleware checkAdminRole)
            const response = await service.post('/api/publishers', data);
            return response.data; // Trả về { success, message, data: { publisher } }
        } catch (error) {
            throw error;
        }
    },
    updatePublisher: async (id, data) => {
        try {
            const service = await getBookService();
            // Backend: PUT /api/publishers/:id (Middleware checkAdminRole)
            const response = await service.put(`/api/publishers/${id}`, data);
            return response.data; // Trả về { success, message, data: { publisher } }
        } catch (error) {
            throw error;
        }
    },
    deletePublisher: async (id) => {
        try {
            const service = await getBookService();
            // Backend: DELETE /api/publishers/:id (Middleware checkAdminRole)
            const response = await service.delete(`/api/publishers/${id}`);
            return response.data; // Trả về { success, message }
        } catch (error) {
            throw error;
        }
    },
};
export default book_service;
