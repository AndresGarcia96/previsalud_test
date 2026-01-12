import { Badge } from "antd";
import { MenuItem } from "./types/menu_item_type";

import CustomSpin from "@/components/common/custom_spin/CustomSpin";

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  badgeCount?: number
): MenuItem {
  return {
    key,
    children,
    label,
    icon: badgeCount ? (
      <Badge
        count={badgeCount}
        offset={[-37, 7]}
        style={{
          justifyContent: "center",
          justifyItems: "center",
          alignContent: "center",
          alignItems: "center",
          paddingTop: "3.1px",
        }}
      >
        {icon}
      </Badge>
    ) : (
      icon
    ),
  } as MenuItem;
}

export function getItemSpin(key: React.Key): MenuItem {
  return {
    key,
    label: <CustomSpin />,
    icon: null,
    children: [],
  } as MenuItem;
}
