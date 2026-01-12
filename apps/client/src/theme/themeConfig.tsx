import { type ThemeConfig } from "antd";

const themeConfig: ThemeConfig = {
  token: {
    fontSize: 12,
    colorPrimary: "#00404f",
    colorText: "#313131",
    colorSplit: "#A7AFBAB2",
  },
  components: {
    Layout: {
      siderBg: "#00404f",
    },
    Menu: {
      itemActiveBg: "#00404f",
      itemBg: "#00404f",
      itemColor: "#F7F7F7",
      itemHoverBg: "#017DC0",
      itemHoverColor: "#F7F7F7",
      itemSelectedBg: "#EFF7F8",
      itemSelectedColor: "#00B5E8",
      subMenuItemSelectedColor: "#00B5E8",
      colorBgElevated: "#00404f",
      dropdownWidth: 222,
    },
    Form: {
      labelColor: "#00404f",
    },
    Descriptions: {
      labelBg: "#00404f17",
      lineWidth: 1.3,
      titleColor: "#272727",
      titleMarginBottom: 7,
      margin: 0,
      padding: 0,
    },
    Table: {
      rowHoverBg: "#DFEBF2",
      headerBg: "#DFEBF2",
      lineWidth: 0.7,
      lineHeight: 1.5,
      margin: 0,
      padding: 0,
    },
    Card: {
      headerBg: "#7B62A731",
      headerHeightSM: 17,
    },
    Tabs: {
      colorBgContainer: "#005C70",
      itemSelectedColor: "#F7F7F7",
      colorBorderSecondary: "#005C70",
    },
    Switch: {
      colorPrimary: "#1D8348",
      colorTextLightSolid: "#F7F7F7",
      colorTextQuaternary: "#8C1111",
      colorTextTertiary: "#A7BAB7",
      colorPrimaryHover: "#3F97AF",
    },
    Select: {
      borderRadius: 7,
    },
    Input: {
      borderRadius: 7,
    },
    InputNumber: {
      borderRadius: 7,
    },
    DatePicker: {
      borderRadius: 7,
    },
    Collapse: {
      colorBgContainer: "#FCFCFC",
      contentBg: "#FCFCFC",
    },
    List: {
      titleMarginBottom: 0,
    },
    Upload: {
      padding: 8,
    },
  },
};

export default themeConfig;
