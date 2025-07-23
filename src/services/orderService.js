let orderService = null;
const getOrderService = async () => {
    if (!orderService) {
        const module = await import('./api');
        const createServiceApi = module.default;
        orderService = createServiceApi(import.meta.env.VITE_ORDER_SERVICE || 'http://localhost:8001');
    }
    return orderService;
};


const order_service = {
    // Cart Service API
    getCart: async () => {
        try {
            const service = await getOrderService();
            const response = await service.get(`/api/cart`);
            return response.data; // { success, message, data: { cart, totalPrice } }
        } catch (error) {
            throw error;
        }
    },
    addToCart: async (data) => {
        try {
            const service = await getOrderService();
            const response = await service.post(`/api/cart/add`, data);
            return response.data; // { success, message, data: { cart } }
        } catch (error) {
            throw error;
        }
    },
    updateCartItem: async (bookId, quantity) => {
        try {
            const service = await getOrderService();
            const response = await service.put(`/api/cart/update`, { bookId, quantity });
            return response.data; // { success, message, data: { cart } }
        } catch (error) {
            throw error;
        }
    },
    removeFromCart: async (bookId) => {
        try {
            const service = await getOrderService();
            const response = await service.delete(`/api/cart/remove`, { data: { bookId } });
            return response.data; // { success, message, data: { cart } }
        } catch (error) {
            throw error;
        }
    },
    clearCart: async () => {
        try {
            const service = await getOrderService();
            const response = await service.delete(`/api/cart/clear`);
            return response.data; // { success, message, data: { cart } }
        } catch (error) {
            throw error;
        }
    },

    // Order Service API
    createOrder: async (orderData) => {
        try {
            const service = await getOrderService();
            const response = await service.post('/api/order', orderData);
            return response.data; // { success, message, data: { order } } for COD or { orderId, orderCode, paymentId, finalAmount } for VNPay
        } catch (error) {
            throw error;
        }
    },
    createVnpayPaymentUrl: async ({ orderId, paymentId, amount, bankCode, language }) => {
        try {
            const service = await getOrderService();
            const response = await service.post('/api/order/create_payment_url', { orderId, paymentId, amount, bankCode, language });
            return response.data; // { success, message, data: { vnpUrl } }
        } catch (error) {
            throw error;
        }
    },
    getOrdersByUser: async (params = {}) => {
        try {
            const service = await getOrderService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/order?${queryString}`);
            return response.data; // { success, message, data: { orders, pagination } }
        } catch (error) {
            throw error;
        }
    },
    getOrderById: async (id) => {
        try {
            const service = await getOrderService();
            const response = await service.get(`/api/order/${id}`);
            return response.data; // { success, message, data: { order } }
        } catch (error) {
            throw error;
        }
    },
    updateOrderStatus: async (id, newStatusData) => {
        try {
            const service = await getOrderService();
            const response = await service.put(`/api/order/${id}`, newStatusData);
            return response.data; // { success, message, data: { order } }
        } catch (error) {
            throw error;
        }
    },
    getAllOrders: async (params = {}) => {
        try {
            const service = await getOrderService();
            const queryString = new URLSearchParams(params).toString();
            const response = await service.get(`/api/order/all?${queryString}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    cancelOrder: async (id) => {
        try {
            const service = await getOrderService();
            const response = await service.delete(`/api/order/${id}`);
            return response.data; // { success, message, data: { order } }
        } catch (error) {
            throw error;
        }
    },
    retryPayment: async (orderId) => {
        try {
            const service = await getOrderService();
            const response = await service.post(`/api/order/${orderId}/retry-payment`);
            return response.data; // { success, message, data: { order } }
        } catch (error) {
            throw error;
        }
    },
    previewOrder: async (orderData) => {
        try {
            const service = await getOrderService();
            const response = await service.post('/api/order/preview', orderData);
            return response.data; // { success, message, data: { ... } }
        } catch (error) {
            throw error;
        }
    },

};

export default order_service;