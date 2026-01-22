import { Provider } from "react-redux";
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { StyleProvider } from "@ant-design/cssinjs";
import { act } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import userReducer from "@/redux/features/user/userSlice";
import modalReducer from "@/redux/features/common/modal/modalSlice";

import { userApi } from "@/redux/apis/user/userApi";
import { authLoginApi } from "@/redux/apis/login_user/loginUserApi";
import { authRegisterApi } from "@/redux/apis/register_user/registerUserApi";

const createTestStore = (preloadedState?: any) => {
  const rootReducer = combineReducers({
    user: userReducer,
    modal: modalReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authLoginApi.reducerPath]: authLoginApi.reducer,
    [authRegisterApi.reducerPath]: authRegisterApi.reducer,
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
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
};

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: any;
  store?: ReturnType<typeof createTestStore>;
}

const renderWithProviders = async (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <StyleProvider hashPriority="high">{children}</StyleProvider>
      </Provider>
    );
  }

  let result: any;

  await act(async () => {
    result = render(ui, { wrapper: Wrapper, ...renderOptions });
  });

  return { store, ...result };
};

export default renderWithProviders;
