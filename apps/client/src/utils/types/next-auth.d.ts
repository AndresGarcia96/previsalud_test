import NextAuth, { DefaultSession } from "next-auth";
import { AllowedRoleType } from "./allowed_role_type";

declare module "next-auth" {
  interface Session {
    user: {
      access_token?: string;
      refresh_token?: string;
      access_token_expires_in?: number;
      id_type?: number;
      id_number?: number;
      principal_email?: string;
      role?: AllowedRoleType;
    } & DefaultSession["user"];
  }
}
