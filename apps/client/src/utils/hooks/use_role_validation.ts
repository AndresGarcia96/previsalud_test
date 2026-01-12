import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import { AllowedRoleType } from "../types/allowed_role_type";

export const useRoleValidation = (allowedRoles: AllowedRoleType[]) => {
  const { data: session, status } = useSession();

  const userSessionRoles = session?.user.role;

  const userRoles = useMemo(() => {
    if (userSessionRoles && Array.isArray(userSessionRoles)) {
      return userSessionRoles.map((role: { name: string }) => role.name);
    }

    return [];
  }, [userSessionRoles]);

  useEffect(() => {
    if (status === "authenticated" && userRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some((allowedRole) =>
        userRoles.includes(allowedRole as AllowedRoleType)
      );

      if (!hasAllowedRole) {
        notFound();
      }
    }
  }, [status, userRoles, allowedRoles]);
};
