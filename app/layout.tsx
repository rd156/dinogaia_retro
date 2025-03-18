import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {Providers} from "./providers";
import Header from "@/components/layout/Header";
import Content from "@/components/layout/Content";
import Footer from "@/components/layout/Footer";
import "./layout.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Dinogaia Reborn",
  description: "Dinogaia Reborn Game",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <meta name="viewport" content="width=1920, initial-scale=1.0"></meta>
      </head> 
      <body className={inter.className}>
        <Providers>
            <div>
              <Header></Header>
              <Content>{children}</Content>
              <Footer></Footer>
            </div>
        </Providers>
      </body>
    </html>
  );
}
