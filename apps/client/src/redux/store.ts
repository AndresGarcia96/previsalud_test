import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import storage from "./storage/storage";

import userReducer from "./features/user/userSlice";
import modalReducer from "./features/common/modal/modalSlice";

import { userApi } from "./apis/user/userApi";
import { authLoginApi } from "./apis/login_user/loginUserApi";
import { authRegisterApi } from "./apis/register_user/registerUserApi";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["user"],
  blacklist: [],
};

const rootReducer = combineReducers({
  user: userReducer,
  modal: modalReducer,

  [userApi.reducerPath]: userApi.reducer,
  [authLoginApi.reducerPath]: authLoginApi.reducer,
  [authRegisterApi.reducerPath]: authRegisterApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat([
      userApi.middleware,
      authLoginApi.middleware,
      authRegisterApi.middleware,
    ]),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
