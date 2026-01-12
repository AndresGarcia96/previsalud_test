"use client";

import React, { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import AdminHeaderLayout from "@/components/admin/header_layout_dashboard/AdminHeaderLayout";
import { Button, Col, Layout, Menu, Row, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { ItemKeys } from "./enums/item_names_and_keys.enums";
import { useMenuItems } from "./items_menu_dashboard_admin/items_menu_dashboard_admin";
import {
  setSelectedKey,
  setSelectedOpenKeys,
} from "@/redux/features/common/modal/modalSlice";

const { Header, Content, Footer, Sider } = Layout;

const CustomDashboardLayoutAdmins: React.FC<{
  customLayoutHeader?: ReactNode;
  customLayoutContent: ReactNode;
  customLayoutFooter?: any;
}> = ({ customLayoutHeader, customLayoutContent, customLayoutFooter }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useMenuItems();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const selectedKeyState = useAppSelector((state) => state.modal.selectedKey);
  const selectedOpenKeysState = useAppSelector(
    (state) => state.modal.selectedOpenKeys
  );

  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = (key: string) => {
    dispatch(setSelectedKey(key));

    router.push(`/admin/${key}`);
  };

  const handleOpenChange: any = (keys: string[]) => {
    dispatch(setSelectedOpenKeys(keys));
  };

  return (
    <Layout
      className="custom-dashboard-layout-sider"
      style={{
        display: "flex",
        minWidth: "888px",
        minHeight: "100vh",
        backgroundColor: "#013B5A",
        margin: "0px",
        padding: "0px",
        overflow: "auto",
      }}
    >
      <Sider
        className="custom--dashboard-layout-sider"
        breakpoint="md"
        collapsedWidth={54}
        width={231}
        onBreakpoint={(broken) => {}}
        onCollapse={(collapsed, type) => {}}
        collapsed={collapsed}
        collapsible
        trigger={null}
        style={{
          backgroundColor: "#013B5A",
          margin: "0px",
          padding: "0px",
          overflow: "auto",
        }}
      >
        <a
          className="custom--dashboard-layout-logo"
          style={{
            display: "flex",
            flexFlow: "column wrap",
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            backgroundColor: "#f2f2f2",
            paddingBlock: "7px",
            overflow: "hidden",
          }}
          onClick={() => {
            router.replace("/admin/homepage", { scroll: true });
          }}
        >
          <img
            src={
              collapsed
                ? "/logos/icono_fenix_naranja_sin_fondo.png"
                : "/logos/fenix-ver-naranja-sin-fondo-ok.png"
            }
            alt="Logo de Fenix"
            style={{
              maxWidth: collapsed ? "92%" : "62%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </a>

        <Menu
          className="custom--dashboard-layout-menu"
          mode="inline"
          items={items}
          selectedKeys={[selectedKeyState]}
          defaultSelectedKeys={[ItemKeys.ITEM_HOMEPAGE_KEY]}
          openKeys={selectedOpenKeysState}
          onOpenChange={handleOpenChange}
          onClick={({ key }) => handleMenuClick(key)}
          style={{
            minHeight: "100vh",
            margin: "0px",
            padding: "0px",
          }}
        />
      </Sider>
      <Layout
        className="custom-dashboard-layout-components"
        style={{
          display: "flex",
          backgroundColor: "#DFEBF2",
          margin: "0px",
          padding: "0px",
        }}
      >
        <Header
          className="custom--dashboard-layout-header"
          style={{
            position: "sticky",
            display: "flex",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            background: "#013B5A",
            padding: "0px",
            margin: "0px",
          }}
        >
          <Row
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <Col
              xs={12}
              sm={6}
              md={6}
              lg={6}
              style={{
                display: "flex",
                flexFlow: "row wrap",
                alignContent: "center",
                justifyContent: "flex-start",
                paddingLeft: "17px",
              }}
            >
              <Button
                type="text"
                icon={
                  collapsed ? (
                    <MenuUnfoldOutlined style={{ color: "#013B5A" }} />
                  ) : (
                    <MenuFoldOutlined style={{ color: "#013B5A" }} />
                  )
                }
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: "37px",
                  height: "37px",
                  backgroundColor: "#00B5E8",
                }}
              />
            </Col>

            <Col
              xs={12}
              sm={18}
              md={18}
              lg={18}
              style={{
                display: "flex",
                flexFlow: "row wrap",
                justifyContent: "flex-end",
                alignContent: "center",
                paddingRight: "17px",
              }}
            >
              {customLayoutHeader || <AdminHeaderLayout />}
            </Col>
          </Row>
        </Header>
        <Content
          className="custom--dashboard-layout-content"
          style={{ padding: "0px", margin: "22px 13px" }}
        >
          <div
            style={{
              display: "flex",
              flexFlow: "column wrap",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              backgroundColor: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              padding: "13px",
              margin: "0px",
            }}
          >
            {customLayoutContent}
          </div>
        </Content>
        <Footer
          className="custom--dashboard-layout-footer"
          style={{
            height: "13px",
            display: "flex",
            flexFlow: "column wrap",
            textAlign: "center",
            backgroundColor: colorBgContainer,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          {customLayoutFooter ||
            `Fenix © ${new Date().getFullYear()} - Versión: ${
              process.env.NEXT_PUBLIC_APP_VERSION
            }`}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default CustomDashboardLayoutAdmins;
