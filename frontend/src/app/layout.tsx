import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "TaskFlow - Quản lý công việc thông minh",
  description: "Giải pháp quản lý công việc tinh gọn, hiệu quả cho mọi team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${roboto.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900" suppressHydrationWarning>
        <Providers>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
