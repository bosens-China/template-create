import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: 'list',
  initialState,
  reducers: {
    enlarge: (state) => {
      const obj = state;
      obj.value += 1;
    },
    reduce: (state) => {
      const obj = state;
      obj.value -= 1;
    },
    reset: (state, action: PayloadAction<number>) => {
      const obj = state;
      obj.value += action.payload;
    },
  },
});

export const { enlarge, reduce, reset } = counterSlice.actions;

export default counterSlice.reducer;
