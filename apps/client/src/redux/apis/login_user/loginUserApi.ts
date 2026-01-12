import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { IUser } from "@/utils/interfaces/user.interface";

export const authLoginApi = createApi({
  reducerPath: "authLoginApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
  }),

  endpoints: (builder) => ({
    loginAdminOrAuditor: builder.mutation<
      Partial<IUser>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "loginAdminOrAuditor",
        method: "POST",
        body: credentials,
      }),
    }),

    loginUser: builder.mutation<
      Partial<IUser>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "loginUser",
        method: "POST",
        body: credentials,
      }),
    }),

    verifyCodeAndLoginAdminOrAuditor: builder.mutation<
      Partial<IUser>,
      { email: string; verification_code: number }
    >({
      query: ({ email, verification_code }) => ({
        url: `verifyCodeAndLoginAdminOrAuditor/${email}`,
        method: "POST",
        body: { verification_code },
      }),
    }),

    verifyCodeAndLoginUser: builder.mutation<
      Partial<IUser>,
      { email: string; verification_code: number }
    >({
      query: ({ email, verification_code }) => ({
        url: `verifyCodeAndLoginUser/${email}`,
        method: "POST",
        body: { verification_code },
      }),
    }),

    resendVerificationUserCode: builder.mutation<
      Partial<IUser>,
      { email: string }
    >({
      query: ({ email }) => ({
        url: "resendVerificationUserCode",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginAdminOrAuditorMutation,
  useLoginUserMutation,
  useVerifyCodeAndLoginAdminOrAuditorMutation,
  useVerifyCodeAndLoginUserMutation,
  useResendVerificationUserCodeMutation,
} = authLoginApi;
