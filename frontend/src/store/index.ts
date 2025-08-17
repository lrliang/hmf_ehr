import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// 导入各个slice
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import employeeSlice from './slices/employeeSlice';
import uiSlice from './slices/uiSlice';

// 持久化配置
const persistConfig = {
  key: 'hmf-ehr-root',
  storage,
  whitelist: ['auth'], // 只持久化auth状态
  version: 1,
};

// 根reducer
const rootReducer = combineReducers({
  auth: authSlice,
  user: userSlice,
  employee: employeeSlice,
  ui: uiSlice,
});

// 持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
});

// 创建persistor
export const persistor = persistStore(store);

// 类型定义
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
