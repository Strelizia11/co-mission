"use client";

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address, EthBalance } from "@coinbase/onchainkit/identity";
import Image from "next/image";
import NotificationDropdown from "./NotificationDropdown";

interface DashboardHeaderProps {
  user?: {
    name: string;
    role: string;
    email: string;
  };
  onToggleNav?: () => void;
}

export default function DashboardHeader({ user, onToggleNav }: DashboardHeaderProps) {
  console.log('DashboardHeader: User received:', user);

  return (
    <header className="flex flex-row justify-between items-center p-2 sm:p-4 bg-[#191B1F] shadow-md relative z-30 gap-2">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-2 sm:gap-4 w-auto">
        {/* Burger for mobile */}
        <button
          aria-label="Open menu"
          className="text-white mr-2 sm:mr-2"
          onClick={onToggleNav}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            style={{ padding: "8px" }}
            src="/logo.svg"
            alt="Co-Mission Logo"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Right Side - Notifications + Connect Wallet */}
      <div className="flex flex-row items-center gap-2 sm:gap-3 w-auto justify-end">
        {/* Notifications dropdown */}
        {user && <NotificationDropdown user={user} />}
        <Wallet className="z-10 w-auto">
          <div className="text-black px-2 py-2 text-base sm:text-lg font-semibold w-auto">
            <ConnectWallet className="w-auto text-white bg-[#191B1F] border-2 border-[#FFBF00] rounded-[15px] hover:bg-[#AE8200]">
              <span className="text-base sm:text-l w-auto sm:w-36">Connected</span>
            </ConnectWallet>
          </div>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>
    </header>
  );
}
