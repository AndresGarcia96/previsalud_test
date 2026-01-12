"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setIsPageLoading } from "@/redux/features/common/modal/modalSlice";

import { Tabs } from "antd";

import { FaRegUserCircle } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";

import AdminLoginForm from "@/components/auth/admin/admin_login_form/AdminLoginForm";
import UserLoginForm from "@/components/auth/user/user_login_form/UserLoginForm";

const UsersLoginPage = () => {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  const isPageLoadingState = useAppSelector(
    (state) => state.modal.isPageLoading
  );

  useEffect(() => {
    if (isPageLoadingState && status === "unauthenticated") {
      dispatch(setIsPageLoading(false));
    }
  }, [status, isPageLoadingState]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        alignContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="background-page"
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          backgroundImage: "url('/background/back-soft-blue-lines-wave.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
        }}
      />
      <div
        className="content-page"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBlock: "31px",
          }}
        >
          <img
            src="/logos/fenix-ver-naranja-sin-fondo-ok.png"
            alt="Logo de Fenix"
            style={{ height: "77px" }}
          />
        </div>

        <Tabs
          type="card"
          centered
          tabBarGutter={13}
          tabBarStyle={{ marginBottom: 13 }}
          items={[
            {
              className: "user-card-login",
              key: "1",
              label: "Usuarios",
              icon: <FaRegUserCircle />,
              children: <UserLoginForm />,
            },
            {
              className: "admin-card-login",
              key: "2",
              label: "Administradores",
              icon: <GrUserAdmin />,
              children: <AdminLoginForm />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default UsersLoginPage;
