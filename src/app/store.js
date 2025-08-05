// src/app/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from '../features/auth/authSlice';
import userSlice from '../features/user/userSlice';
import addressSlice from '../features/address/addressSlice';
import profileSlice from '../features/profile/profileSlice';
import authorSlice from '../features/author/authorSlice';
import categorySlice from '../features/category/categorySlice';
import publisherSlice from '../features/publisher/publisherSlice';
import bookSlice from '../features/book/bookSlice';
import cartSlice from '../features/cart/cartSlice';
import orderSlice from '../features/order/orderSlice';
import reviewSlice from '../features/review/reviewSlice';




import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// 1. Combine tất cả các reducers thành một rootReducer
const rootReducer = combineReducers({
    auth: authSlice,
    user: userSlice,
    address: addressSlice,
    profile: profileSlice,
    author: authorSlice,
    category: categorySlice,
    publisher: publisherSlice,
    book: bookSlice,
    cart: cartSlice,
    order: orderSlice,
    review: reviewSlice,
    
});

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth'],
    serialize: true,
    deserialize: true,
    timeout: 10000,
};

// 2. Áp dụng persistReducer cho rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export const persistor = persistStore(store);