// src/services/api.js
import axios from 'axios';
import { toast } from 'react-toastify';
import { setAccessToken, logoutSuccess } from '../features/auth/authSlice';

let reduxStore = null;

export const setReduxStore = (storeInstance) => {
    reduxStore = storeInstance;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const createServiceApi = (baseURL) => {
    const service = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });
    service.interceptors.request.use(
        (config) => {
            const state = reduxStore?.getState();
            let token = state?.auth?.accessToken;
            if (!token) {
                token = localStorage.getItem('token');
            }
            // Chỉ thêm Authorization nếu có token và không phải request đăng nhập
            if (token && !config.headers.Authorization && !(config.url && config.url.includes('/api/users/login'))) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Interceptor cho response: Xử lý lỗi 401 và Refresh Token
    service.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const status = error.response?.status;
            const errorMessage = error.response?.data?.message;
            const isLoginRequest = originalRequest.url.includes('/api/users/login');

            console.error('API Response Error:', { status, url: originalRequest.url, message: errorMessage });

            // Case 1: Token hết hạn (401) và không phải request đăng nhập hoặc refresh token
            if (status === 401 && !originalRequest._retry && !isLoginRequest && originalRequest.url !== '/api/users/refresh-token') {
                originalRequest._retry = true;
                if (!isRefreshing) {
                    isRefreshing = true;
                    console.log('[AUTH] Access token expired. Attempting to refresh token...');
                    try {
                        console.log('[AUTH] Calling refresh token API...');
                        const refreshResponse = await axios.post(
                            `${import.meta.env.VITE_USER_SERVICE || 'http://localhost:5000'}/api/users/refresh-token`,
                            {},
                            { withCredentials: true }
                        );
                        const newAccessToken = refreshResponse.data.data.accessToken;
                        console.log('[AUTH] Refresh token successful. New access token received.');

                        if (reduxStore) {
                            reduxStore.dispatch(setAccessToken(newAccessToken));
                        }
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        console.log('[AUTH] Retrying original request with new token:', originalRequest.url);
                        processQueue(null, newAccessToken);
                        return service(originalRequest);

                    } catch (refreshError) {
                        console.error('[AUTH] Refresh token failed:', refreshError.response?.data || refreshError.message);
                        processQueue(refreshError, null);
                        if (reduxStore) {
                            reduxStore.dispatch(logoutSuccess());
                        }
                        // Chỉ hiển thị toast nếu không ở trang login
                        const isOnLoginPage = window.location.pathname.includes('/admin/login') || window.location.pathname === '/login';
                        if (!isOnLoginPage) {
                            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                        }
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                } else {
                    console.log('[AUTH] Another request is already refreshing the token. Queuing request:', originalRequest.url);
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        console.log('[AUTH] Resuming queued request with new token:', originalRequest.url);
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return service(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }
            }

            // Case 2: Lỗi đăng nhập (401 từ /api/users/login)
            if (isLoginRequest && status === 401) {
                console.error('Login failed:', errorMessage);
                // Chỉ hiển thị toast nếu không ở trang login
                const isOnLoginPage = window.location.pathname.includes('/admin/login') || window.location.pathname === '/login';
                if (!isOnLoginPage) {
                    toast.error(errorMessage || "Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.");
                }
                return Promise.reject(error);
            }

            // Case 3: Lỗi 401 khi refresh token thất bại hoặc khi gọi các API xác thực
            if (
                status === 401 &&
                (
                    originalRequest.url.includes('/api/users/refresh-token') ||
                    originalRequest.url.includes('/api/users/me') ||
                    originalRequest.url.includes('/api/users/login')
                )
            ) {
                if (reduxStore) {
                    reduxStore.dispatch(logoutSuccess());
                }
                // Chỉ hiển thị toast nếu không ở trang login
                const isOnLoginPage = window.location.pathname.includes('/admin/login') || window.location.pathname === '/login';
                if (!isOnLoginPage) {
                    toast.error(errorMessage || "Bạn không có quyền truy cập hoặc phiên đăng nhập đã hết hạn.");
                }
            }
            return Promise.reject(error);
        }
    );

    return service;
};

export default createServiceApi;