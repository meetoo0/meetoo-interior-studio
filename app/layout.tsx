import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEETOO | Interior Design Studio",
  description: "Thoughtful interiors shaped by light, material and the way people live. MEETOO Interior Design Studio, Uyo, Nigeria."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}