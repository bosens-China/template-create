import { configureStore } from '@reduxjs/toolkit';
import list from './list';

export const store = configureStore({
  reducer: {
    list,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
