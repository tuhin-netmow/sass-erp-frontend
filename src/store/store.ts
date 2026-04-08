import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { authSlice } from "./features/auth/authSlice";
import adminReducer from "./features/admin/adminSlice";
import { loadState, saveState } from "./localStorage";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { baseApi } from "./baseApi";
import currencyReducer from "./currencySlice";
import layoutReducer from "./layoutSlice";
import adminApi from "./features/admin/adminApiService";

const LOCAL_STORAGE_KEY = "reduxState";

// Load persisted state from localStorage
const loadedState = loadState<any>(LOCAL_STORAGE_KEY);

// 🌐 IMPORTANT: Use authSlice's getInitialState() to load from localStorage/cookies
// This ensures we always try to load credentials from localStorage first
// Only use loadedState.auth if it has a token (valid auth state)
const preloadedState: any = {
  ...loadedState,
  // Use loaded auth state if it has a token, otherwise use getInitialState()
  // This is critical for cross-subdomain auth
  auth: (loadedState?.auth?.token)
    ? loadedState.auth
    : authSlice.getInitialState(),
};

console.log('[Store] ===== Initializing Redux Store =====');
console.log('[Store] Loaded state from reduxState key:', !!loadedState);
console.log('[Store] Preloaded auth state:', {
  hasUser: !!preloadedState.auth?.user,
  hasToken: !!preloadedState.auth?.token,
  hasCompany: !!preloadedState.auth?.company,
});

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  currency: currencyReducer,
  layout: layoutReducer,
  [baseApi.reducerPath]: baseApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware as any, adminApi.middleware as any),
  preloadedState: preloadedState as any,
});

// Save state on every change
store.subscribe(() => {
  saveState(LOCAL_STORAGE_KEY, {
    auth: store.getState().auth,
    admin: store.getState().admin,
    currency: store.getState().currency,
    layout: store.getState().layout,
  });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// HOOKS
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
