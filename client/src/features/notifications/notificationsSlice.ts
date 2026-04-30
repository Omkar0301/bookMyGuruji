import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

interface NotificationsState {
  list: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  list: [],
  unreadCount: 0,
  loading: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.list = action.payload;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.list.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.list.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setNotifications, markAsRead, addNotification, setUnreadCount, setLoading } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
