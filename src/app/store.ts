import { configureStore } from "@reduxjs/toolkit";
import bondReducer from '../features/bondSlice';
import userReducer from '../features/userSlice';

export const store = configureStore({
    reducer: {
        bond: bondReducer,
        user: userReducer
    },
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;