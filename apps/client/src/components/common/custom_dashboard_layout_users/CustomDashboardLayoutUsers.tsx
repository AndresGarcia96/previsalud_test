"use client";

import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Layout, theme } from "antd";

const { Header, Content, Footer } = Layout;

const CustomDashboardLayoutUsers: React.FC<{
  customLayoutHeader?: ReactNode;
  customLayoutContent: ReactNode;
  customLayoutFooter?: any;
}> = ({ customLayoutHeader, customLayoutContent, customLayoutFooter }) => {
  const router = useRouter();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout
      className="custom-dashboard-layout"
      style={{
        minHeight: "100vh",
        minWidth: "720px",
        backgroundColor: "transparent",
      }}
    >
      <Layout
        className="custom-dashboard-apps-components"
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#DFEBF2",
          minHeight: "100vh",
        }}
      >
        <Header
          className="custom-dashboard-layout-header"
          style={{
            position: "sticky",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            backgroundColor: "#013B5A",
            top: "0px",
            padding: "0px",
            margin: "0px",
            zIndex: 1,
          }}
        >
          {customLayoutHeader}
        </Header>

        <Content
          className="custom--dashboard-layout-content"
          style={{
            display: "flex",
            flexFlow: "column wrap",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            paddingBlock: "13px",
            margin: "13px",
            backgroundColor: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          {customLayoutContent}
        </Content>

        <Footer
          className="custom--dashboard-layout-footer"
          style={{
            textAlign: "center",
            backgroundColor: colorBgContainer,
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          {customLayoutFooter ||
            `Fenix © ${new Date().getFullYear()}💙 - Versión: ${process.env.NEXT_PUBLIC_APP_VERSION}`}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default CustomDashboardLayoutUsers;
