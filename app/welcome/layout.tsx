// app/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isWelcomePage = pathname === "/welcome";

  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        {!isWelcomePage && (
          <header className="flex justify-between items-center p-4 bg-[#191B1F] shadow-md">
            <h1 className="text-xl font-bold text-blue-600">
              <Link href="/">MySite</Link>
            </h1>
            <nav className="flex gap-4">
              <Link href="/auth/register" className="px-4 py-2 bg-green-600 text-white rounded">
                Register
              </Link>
            </nav>
          </header>
        )}
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}
