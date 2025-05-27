import { configureStore } from "@reduxjs/toolkit";
import bondReducer from '../features/bondSlice';
import userReducer from '../features/userSlice';
import adminReducer from '../features/adminSlice';

export const store = configureStore({
    reducer: {
        bond: bondReducer,
        user: userReducer,
        admin: adminReducer
    },
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;