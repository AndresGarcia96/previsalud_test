import React from "react";

import { DM_Sans } from "next/font/google";
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import themeConfig from "@/theme/themeConfig";
import es_ES from "antd/locale/es_ES";
import { Providers } from "@/redux/providers";
import SessionAuthProvider from "@/context/SessionAuthProvider";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fenix",
  description: "Plataforma web",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="es"
      style={{ margin: 0, padding: 0 }}
      suppressHydrationWarning
      cz-shortcut-listen="true"
    >
      <body className={dmSans.className} style={{ margin: 0, padding: 0 }}>
        <Providers>
          <main className="container-main-app">
            <AntdRegistry>
              <SessionAuthProvider>
                <ConfigProvider theme={themeConfig} locale={es_ES}>
                  {children}
                </ConfigProvider>
              </SessionAuthProvider>
            </AntdRegistry>
          </main>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
