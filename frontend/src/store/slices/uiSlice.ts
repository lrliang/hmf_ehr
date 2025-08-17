import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 状态类型
interface UIState {
  // 侧边栏
  siderCollapsed: boolean;
  
  // 主题
  theme: 'light' | 'dark';
  
  // 语言
  locale: 'zh-CN' | 'en-US';
  
  // 加载状态
  globalLoading: boolean;
  
  // 面包屑
  breadcrumbs: Array<{
    title: string;
    path?: string;
  }>;
  
  // 页面标题
  pageTitle: string;
  
  // 通知
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    timestamp: number;
  }>;
  
  // 模态框状态
  modals: Record<string, boolean>;
  
  // 抽屉状态
  drawers: Record<string, boolean>;
}

// 初始状态
const initialState: UIState = {
  siderCollapsed: false,
  theme: 'light',
  locale: 'zh-CN',
  globalLoading: false,
  breadcrumbs: [],
  pageTitle: '',
  notifications: [],
  modals: {},
  drawers: {},
};

// slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 切换侧边栏
    toggleSider: (state) => {
      state.siderCollapsed = !state.siderCollapsed;
    },
    
    // 设置侧边栏状态
    setSiderCollapsed: (state, action: PayloadAction<boolean>) => {
      state.siderCollapsed = action.payload;
    },
    
    // 切换主题
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    // 设置语言
    setLocale: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.locale = action.payload;
    },
    
    // 设置全局加载状态
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    // 设置面包屑
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload;
    },
    
    // 设置页面标题
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    
    // 添加通知
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.unshift(notification);
      
      // 限制通知数量
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    
    // 移除通知
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    // 清空通知
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // 设置模态框状态
    setModalVisible: (state, action: PayloadAction<{ key: string; visible: boolean }>) => {
      state.modals[action.payload.key] = action.payload.visible;
    },
    
    // 设置抽屉状态
    setDrawerVisible: (state, action: PayloadAction<{ key: string; visible: boolean }>) => {
      state.drawers[action.payload.key] = action.payload.visible;
    },
    
    // 重置UI状态
    resetUIState: () => initialState,
  },
});

export const {
  toggleSider,
  setSiderCollapsed,
  toggleTheme,
  setTheme,
  setLocale,
  setGlobalLoading,
  setBreadcrumbs,
  setPageTitle,
  addNotification,
  removeNotification,
  clearNotifications,
  setModalVisible,
  setDrawerVisible,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
