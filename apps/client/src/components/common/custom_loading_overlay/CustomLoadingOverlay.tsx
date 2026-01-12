"use client";

import React from "react";

import { Flex, Spin } from "antd";

const CustomLoadingOverlay: React.FC<{ isLoading: boolean }> = ({
  isLoading,
}) => {
  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexFlow: "unset",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(245, 245, 245, 0.8)",
        zIndex: 9999,
      }}
    >
      <Spin size="large" />
    </div>
  );
};

export default CustomLoadingOverlay;
