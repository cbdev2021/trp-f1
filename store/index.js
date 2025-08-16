import { configureStore } from '@reduxjs/toolkit'
import tourReducer from './tourSlice'

export const store = configureStore({
  reducer: {
    tour: tourReducer,
  },
})

export default store