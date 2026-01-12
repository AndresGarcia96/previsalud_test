"use client";

import React, { ReactNode } from "react";

import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";
import { CiCircleChevDown } from "react-icons/ci";

const CustomDropdown: React.FC<{
  titleCustomDropdown: string;
  iconCustomDropdown: ReactNode;
  iconCustomItem1?: ReactNode;
  iconCustomItem2?: ReactNode;
  iconCustomItem3?: ReactNode;
  iconCustomItem4?: ReactNode;
  titleCustomItem1?: string;
  titleCustomItem2?: string;
  titleCustomItem3?: string;
  titleCustomItem4?: string;
  handleClickCustomItem1?: () => void;
  handleClickCustomItem2?: () => void;
}> = ({
  titleCustomDropdown,
  iconCustomDropdown,
  iconCustomItem1,
  iconCustomItem2,
  iconCustomItem3,
  iconCustomItem4,
  titleCustomItem1,
  titleCustomItem2,
  titleCustomItem3,
  titleCustomItem4,
  handleClickCustomItem1,
  handleClickCustomItem2,
}) => {
  const items: MenuProps["items"] = [
    titleCustomItem1 && iconCustomItem1
      ? {
          key: "1",
          label: titleCustomItem1,
          icon: iconCustomItem1,
          onClick: handleClickCustomItem1,
        }
      : null,
    {
      type: "divider",
    },
    titleCustomItem2 && iconCustomItem2
      ? {
          key: "2",
          label: titleCustomItem2,
          icon: iconCustomItem2,
          onClick: handleClickCustomItem2,
          danger: true,
        }
      : null,
  ];

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <a style={{ color: "#f7f7f7", fontSize: 15 }}>
        <Space>
          {titleCustomDropdown}

          {iconCustomDropdown}

          <CiCircleChevDown size={17} style={{ color: "#3F97AF" }} />
        </Space>
      </a>
    </Dropdown>
  );
};

export default CustomDropdown;
