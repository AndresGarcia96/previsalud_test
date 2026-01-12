"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signOut } from "next-auth/react";
import { persistor } from "@/redux/store";
import { redirect, useRouter } from "next/navigation";

import CustomDropdown from "@/components/common/custom_dropdown/CustomDropdown";
import CustomSpin from "@/components/common/custom_spin/CustomSpin";
import { FaSignOutAlt } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";

import { setStateUser } from "@/redux/features/user/userSlice";

import { useGetAnyUserByIdNumberQuery } from "@/redux/apis/user/userApi";

import { getFirstName } from "@/helpers/get_first_name/get_first_name";

const AdminHeaderLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const idNumberAdminState = useAppSelector((state) => state.user.id_number);

  const nameUserState = useAppSelector((state) => state.user.name);
  const lastNameUserState = useAppSelector((state) => state.user.last_name);

  const {
    data: userActiveDatabyIdNumberData,
    isLoading: userActiveDatabyIdNumberLoading,
    isFetching: userActiveDatabyIdNumberFetching,
    isError: userActiveDatabyIdNumberError,
  } = useGetAnyUserByIdNumberQuery(idNumberAdminState, {
    skip: !idNumberAdminState,
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
    <>
      {!nameUserState && !lastNameUserState ? (
        <CustomSpin />
      ) : (
        <CustomDropdown
          titleCustomDropdown={`HOLA, ${getFirstName(
            nameUserState
          )} ${getFirstName(lastNameUserState)}`}
          iconCustomItem2={<FaSignOutAlt />}
          titleCustomItem2="Cerrar Sesión"
          handleClickCustomItem2={handleClickSignOut}
          iconCustomDropdown={<UserOutlined />}
        />
      )}
    </>
  );
};

export default AdminHeaderLayout;
