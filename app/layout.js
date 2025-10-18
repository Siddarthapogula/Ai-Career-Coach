import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import ClientToast from "@/components/ClientToast";
// import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Ai Career Coach",
  description: "Ai Powered Career Coach",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
    appearance={
      {baseTheme : dark}
    }
     publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en"  suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            // enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className=" min-h-screen">
              {children}
            </main>
            <ClientToast/>
            <footer className=" bg-muted/50 py-12">
              <div className=" container mx-auto px-4 text-center">
                <p>Made with ♡ by Siddartha Pogula</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
