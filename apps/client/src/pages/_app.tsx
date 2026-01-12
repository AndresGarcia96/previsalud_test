import React from "react";

import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";

import themeConfig from "../theme/themeConfig";

const App = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider theme={themeConfig}>
    <Component {...pageProps} />
  </ConfigProvider>
);

export default App;
