"use client";

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSession } from "next-auth/react";

import {
  getItem,
  getItemSpin,
} from "@/helpers/get_item_menu_dashboard_layout/get_item_menu_dashboard_layout";

import { FaHome } from "react-icons/fa";

import { setStateUser } from "@/redux/features/user/userSlice";

import {
  ItemKeys,
  ItemNames,
} from "@/components/common/custom_dashboard_layout_admins/enums/item_names_and_keys.enums";

export const useMenuItems = () => {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  const idNumberUserSession = session?.user?.id_number;

  const idNumberUserSessionState = useAppSelector(
    (state) => state.user.id_number
  );

  useEffect(() => {
    if (!idNumberUserSessionState && idNumberUserSession) {
      dispatch(
        setStateUser({ field: "id_number", value: idNumberUserSession })
      );
    }
  }, [idNumberUserSessionState, idNumberUserSession]);

  const menuItems = useMemo(() => {
    if (!idNumberUserSessionState || !idNumberUserSession) {
      return [getItemSpin("spinner")];
    }

    return [
      getItem(
        ItemNames.ITEM_HOMEPAGE,
        ItemKeys.ITEM_HOMEPAGE_KEY,
        <FaHome size={17} />
      ),
    ].filter(Boolean);
  }, []);

  return menuItems;
};
