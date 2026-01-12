"use client";

import { SessionProvider } from "next-auth/react";

const SessionAuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};
export default SessionAuthProvider;
