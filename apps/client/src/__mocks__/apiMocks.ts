// Mock de userApi
jest.mock("@/redux/apis/user/userApi", () => ({
  userApi: {
    reducerPath: "userApi",
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {},
  },
}));

// Mock de authLoginApi
jest.mock("@/redux/apis/login_user/loginUserApi", () => ({
  authLoginApi: {
    reducerPath: "authLoginApi",
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {},
  },
}));

// Mock de authRegisterApi
jest.mock("@/redux/apis/register_user/registerUserApi", () => ({
  authRegisterApi: {
    reducerPath: "authRegisterApi",
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    endpoints: {},
  },
}));
