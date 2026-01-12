"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signOut } from "next-auth/react";
import { persistor } from "@/redux/store";
import { redirect, useRouter } from "next/navigation";

import { Col, Row } from "antd";
import CustomDropdown from "@/components/common/custom_dropdown/CustomDropdown";
import CustomSpin from "@/components/common/custom_spin/CustomSpin";

import { FaSignOutAlt } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";

import { setStateUser } from "@/redux/features/user/userSlice";

import { useGetAnyUserByIdNumberQuery } from "@/redux/apis/user/userApi";

import { getFirstName } from "@/helpers/get_first_name/get_first_name";

const UserHeaderLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const idNumberUserState = useAppSelector((state) => state.user.id_number);

  const nameUserState = useAppSelector((state) => state.user.name);
  const lastNameUserState = useAppSelector((state) => state.user.last_name);

  const {
    data: userActiveDatabyIdNumberData,
    isLoading: userActiveDatabyIdNumberLoading,
    isFetching: userActiveDatabyIdNumberFetching,
    isError: userActiveDatabyIdNumberError,
  } = useGetAnyUserByIdNumberQuery(idNumberUserState, {
    skip: !idNumberUserState,
  });

  useEffect(() => {
    if (
      !nameUserState ||
      (!lastNameUserState && userActiveDatabyIdNumberData)
    ) {
      dispatch(
        setStateUser({
          field: "name",
          value: userActiveDatabyIdNumberData?.name,
        })
      );
      dispatch(
        setStateUser({
          field: "last_name",
          value: userActiveDatabyIdNumberData?.last_name,
        })
      );
    }
  }, [userActiveDatabyIdNumberData, nameUserState, lastNameUserState]);

  const handleClickSignOut = async () => {
    await persistor.purge();

    await signOut();

    await redirect("/login");
  };

  return (
    <Row
      gutter={24}
      justify={"center"}
      align={"stretch"}
      style={{ width: "100%", height: "100%", padding: "0px", margin: "0px" }}
    >
      <Col
        span={6}
        style={{
          display: "flex",
          flexFlow: "column wrap",
          width: "100%",
          height: "100%",
          alignContent: "center",
          justifyContent: "flex-start",
          padding: "0px 31px",
          margin: "0px",
        }}
      >
        <a
          className="custom-layout-logo-header-user"
          style={{
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#f2f2f2",
            overflow: "hidden",
          }}
          onClick={() => {
            router.replace("/user/homepage", { scroll: true });
          }}
        >
          <img
            src="/logos/fenix-ver-naranja-sin-fondo-ok.png"
            alt="Logo de Fenix"
            style={{
              width: "62%",
              maxWidth: "222px",
              objectFit: "contain",
            }}
          />
        </a>
      </Col>

      <Col
        span={18}
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "flex-end",
          alignContent: "center",
          padding: "0px 31px",
          margin: "0px",
        }}
      >
        {!nameUserState && !lastNameUserState ? (
          <CustomSpin />
        ) : (
          <CustomDropdown
            titleCustomDropdown={`HOLA, ${getFirstName(nameUserState)} ${getFirstName(
              lastNameUserState
            )}`}
            iconCustomItem2={<FaSignOutAlt />}
            titleCustomItem2="Cerrar Sesión"
            handleClickCustomItem2={handleClickSignOut}
            iconCustomDropdown={<UserOutlined />}
          />
        )}
      </Col>
    </Row>
  );
};

export default UserHeaderLayout;
