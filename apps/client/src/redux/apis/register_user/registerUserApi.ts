import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { IUser } from "@/utils/interfaces/user.interface";

const addTokenToRequest = async (headers: any, { getState }: any) => {
  const session: any = await getSession();

  if (session?.user?.access_token) {
    headers.set("Authorization", `Bearer ${session.user.access_token}`);
  }
  return headers;
};

export const authRegisterApi = createApi({
  reducerPath: "authRegisterApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
    prepareHeaders(headers, { getState }) {
      return addTokenToRequest(headers, { getState });
    },
  }),

  endpoints: (builder) => ({
    registerSuperAdmin: builder.mutation<IUser, Partial<IUser>>({
      query: (newUser) => ({
        url: "register-super-admin",
        method: "POST",
        body: newUser,
      }),
    }),

    registerAdmin: builder.mutation<IUser, Partial<IUser>>({
      query: (newUser) => ({
        url: "register-admin",
        method: "POST",
        body: newUser,
      }),
    }),

    registerUser: builder.mutation<IUser, Partial<IUser>>({
      query: (newUser) => ({
        url: "registerUser",
        method: "POST",
        body: newUser,
      }),
    }),

    registerAuditor: builder.mutation<IUser, Partial<IUser>>({
      query: (newUser) => ({
        url: "registerAuditor",
        method: "POST",
        body: newUser,
      }),
    }),
  }),
});

export const {
  useRegisterSuperAdminMutation,
  useRegisterAdminMutation,
  useRegisterUserMutation,
  useRegisterAuditorMutation,
} = authRegisterApi;
