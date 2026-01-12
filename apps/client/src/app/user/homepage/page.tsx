"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { redirect } from "next/navigation";

import { setStateUser } from "@/redux/features/user/userSlice";

import useAuthValidation from "@/utils/hooks/use_auth_validation";
import { useRoleValidation } from "@/utils/hooks/use_role_validation";

import UserHomePageContent from "@/components/user/user_homepage/UserHomePageContent";
import CustomMessage from "@/components/common/custom_messages/CustomMessage";
import CustomSpin from "@/components/common/custom_spin/CustomSpin";

import { RolesEnum } from "@/utils/enums/roles/roles.enum";

const UserHomePage = () => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  const idNumberUserSession = session?.user?.id_number;

  useAuthValidation();

  const allowedRoles = [RolesEnum.USER];
  useRoleValidation(allowedRoles);

  const idNumberUserSessionState = useAppSelector(
    (state) => state.user.id_number
  );

  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!idNumberUserSessionState && status === "authenticated") {
      dispatch(
        setStateUser({ field: "id_number", value: idNumberUserSession })
      );
    }

    if (status === "unauthenticated") {
      setShowErrorMessage(true);
      setErrorMessage("¡No autenticado!");
      redirect("/login");
    }
  }, [status, idNumberUserSessionState]);

  return (
    <div className="user-homepage-page">
      {showErrorMessage && (
        <CustomMessage
          typeMessage="error"
          message={errorMessage || "¡Error en la petición!"}
        />
      )}

      {!idNumberUserSessionState || status === "unauthenticated" ? (
        <CustomSpin />
      ) : (
        <div className="user-homepage-content">
          <UserHomePageContent />
        </div>
      )}
    </div>
  );
};

export default UserHomePage;
