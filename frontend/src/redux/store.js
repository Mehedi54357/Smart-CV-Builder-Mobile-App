import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import builderReducer from './slices/builderSlice';
import cvReducer from './slices/cvSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    builder: builderReducer,
    cv: cvReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
