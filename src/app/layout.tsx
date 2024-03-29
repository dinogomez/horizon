import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Provider from "@/components/provider/provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
    title: "Hyre",
    description: "Hyre: Find Careers",
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
            <body
                className={`${GeistSans.variable} ${GeistMono.variable} w-screen overflow-x-hidden font-sans`}
            >
                <div>
                    <Provider>
                        <div>
                            {children}
                            <Toaster />
                        </div>
                    </Provider>
                </div>
            </body>
        </html>
    );
}
