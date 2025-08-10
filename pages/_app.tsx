import "../pages/globals.css";
import { cn } from "@/lib/utils";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppProps } from "next/app";

import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({ subsets: ["latin"] });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className={cn(openSans.className, "bg-white dark:bg-[#313338]")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="discord-clone-theme"
        >
          <SocketProvider>
            <ModalProvider />
            <QueryProvider>
              <Component {...pageProps} />
            </QueryProvider>
          </SocketProvider>
        </ThemeProvider>
      </div>
    </AuthProvider>
  );
}
