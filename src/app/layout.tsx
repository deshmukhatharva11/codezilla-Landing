import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeZilla | Guardians of Innovation",
  description:
    "CodeZilla is a technology powerhouse specializing in AI, Web Development, Mobile Apps, UI/UX, Cloud, and Blockchain. Enter the world of CodeZilla.",
  keywords: [
    "CodeZilla", "AI", "Web Development", "Mobile Apps",
    "UI/UX", "Cloud", "Blockchain", "Technology", "Digital Experiences",
  ],
  metadataBase: new URL("https://codezillatech.in"),
  icons: {
    icon: "/Logo/codezilla.jpg",
    shortcut: "/Logo/codezilla.jpg",
    apple: "/Logo/codezilla.jpg",
  },
  openGraph: {
    title: "CodeZilla | Guardians of Innovation",
    description: "Enter the world of CodeZilla — a cinematic journey through legendary technology.",
    url: "https://codezillatech.in",
    siteName: "CodeZilla",
    type: "website",
  },
  alternates: {
    canonical: "https://codezillatech.in",
  },
};

import CustomCursor from "@/components/ui/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-[100dvh] bg-[#020617] text-white antialiased overflow-x-hidden">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
