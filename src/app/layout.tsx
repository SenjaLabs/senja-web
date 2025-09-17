import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import "@/utils/global-polyfills";
import LiffProvider from "./LiffProvider";
import { BottomNavigation } from "@/components/navbar";
import AppWrapper from "@/components/app-wrapper";
import AuroraBackground from "@/components/aurora-ui";
import SenjaHeader from "@/components/header/senja-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crosschain Lending Protocol",
  description: "lp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-root antialiased min-h-screen`}
      >
        <AuroraBackground />
        <AppWrapper>
          <LiffProvider>
            <SenjaHeader />
            {children}
            <div className="mt-6">
              <BottomNavigation />
            </div>
          </LiffProvider>
        </AppWrapper>
      </body>
    </html>
  );
}
