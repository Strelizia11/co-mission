import Link from "next/link";
import Image from "next/image";

import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-[#191B1F] shadow-lg drop-shadow-lg">
        <h1 className="text-xl font-bold text-blue-600">
          <Link href="/">
            <Image
              style={{ marginLeft: "10px", padding: "15px" }}
              src="/logo.svg"
              alt="App Logo"
              width={250}
              height={250}
            />
          </Link>
        </h1>

        <nav className="mt-2 flex gap-4">
          <Link
            href="/auth/login"
            className="px-5 py-1 rounded-lg font-semibold 
               text-black bg-[#FFBF00] border-2 border-[#FFBF00] 
               hover:bg-[#e6ac00] hover:border-[#e6ac00] 
               transition-colors text-[20px] "
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </>
  );
}
