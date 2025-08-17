import type { ThemeConfig } from 'antd';

// Ant Design 主题配置
export const antdTheme: ThemeConfig = {
  token: {
    // 主色调
    colorPrimary: import.meta.env.VITE_THEME_PRIMARY_COLOR || '#1890ff',
    colorSuccess: import.meta.env.VITE_THEME_SUCCESS_COLOR || '#52c41a',
    colorWarning: import.meta.env.VITE_THEME_WARNING_COLOR || '#faad14',
    colorError: import.meta.env.VITE_THEME_ERROR_COLOR || '#ff4d4f',
    
    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontSize: 14,
    
    // 圆角
    borderRadius: 6,
    
    // 间距
    sizeUnit: 4,
    sizeStep: 4,
    
    // 阴影
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
  },
  components: {
    // Layout 组件
    Layout: {
      headerBg: '#fff',
      headerHeight: 64,
      siderBg: '#001529',
      triggerBg: '#002140',
    },
    
    // Menu 组件
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: '#1890ff',
    },
    
    // Button 组件
    Button: {
      borderRadius: 6,
    },
    
    // Card 组件
    Card: {
      borderRadius: 8,
      paddingLG: 24,
    },
    
    // Table 组件
    Table: {
      borderRadius: 8,
      headerBg: '#fafafa',
    },
    
    // Form 组件
    Form: {
      itemMarginBottom: 24,
    },
  },
  algorithm: undefined, // 可以设置为 theme.darkAlgorithm 启用暗色主题
};

// CSS 变量映射
export const cssVariables = {
  '--primary-color': antdTheme.token?.colorPrimary || '#1890ff',
  '--success-color': antdTheme.token?.colorSuccess || '#52c41a',
  '--warning-color': antdTheme.token?.colorWarning || '#faad14',
  '--error-color': antdTheme.token?.colorError || '#ff4d4f',
  '--border-radius': `${antdTheme.token?.borderRadius || 6}px`,
  '--font-family': antdTheme.token?.fontFamily || 'system-ui',
  '--font-size': `${antdTheme.token?.fontSize || 14}px`,
};
