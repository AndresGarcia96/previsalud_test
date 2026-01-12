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

export const userApi = createApi({
  reducerPath: "userApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`,
    prepareHeaders(headers, { getState }) {
      return addTokenToRequest(headers, { getState });
    },
  }),

  endpoints: (builder) => ({
    getAllUsers: builder.query<IUser[], null>({
      query: () => ({
        url: "getAllUsers",
        method: "GET",
      }),
    }),

    getAllActiveUsers: builder.query<IUser[], null>({
      query: () => ({
        url: "getAllActiveUsers",
        method: "GET",
      }),
    }),

    getUserById: builder.query<IUser, string | null>({
      query: (id) => ({
        url: `getUserById/${id}`,
        method: "GET",
      }),
    }),

    getAnyUserByIdNumber: builder.query<IUser, string | null>({
      query: (idNumber) => ({
        url: `getAnyUserByIdNumber/${idNumber}`,
        method: "GET",
      }),
    }),

    getUserRoles: builder.query<IUser, string>({
      query: (idNumber) => ({
        url: `getUserRoles/${idNumber}`,
        method: "GET",
      }),
    }),

    getAdminUserByIdNumber: builder.query<IUser, string>({
      query: (idNumber) => ({
        url: `getAdminUserByIdNumber/${idNumber}`,
        method: "GET",
      }),
    }),

    getUserByIdNumber: builder.query<IUser, string>({
      query: (idNumber) => ({
        url: `getUserByIdNumber/${idNumber}`,
        method: "GET",
      }),
    }),

    getAuditorUserByIdNumber: builder.query<IUser, string>({
      query: (idNumber) => ({
        url: `getAuditorUserByIdNumber/${idNumber}`,
        method: "GET",
      }),
    }),

    updateUser: builder.mutation<string, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `updateUser/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),

    banUser: builder.mutation<string, string>({
      query: (id) => ({
        url: `banUser/${id}`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetAllActiveUsersQuery,
  useGetAnyUserByIdNumberQuery,
  useGetUserByIdQuery,
  useGetUserRolesQuery,
  useGetAdminUserByIdNumberQuery,
  useGetUserByIdNumberQuery,
  useGetAuditorUserByIdNumberQuery,
  useUpdateUserMutation,
  useBanUserMutation,
} = userApi;
