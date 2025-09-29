"use client";

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address, EthBalance } from "@coinbase/onchainkit/identity";
import Image from "next/image";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  user?: {
    name: string;
    role: string;
    email: string;
  };
  onToggleNav?: () => void;
}

export default function DashboardHeader({ user, onToggleNav }: DashboardHeaderProps) {
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!user?.email) return;
        const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data.notifications)) {
          setUnread(data.notifications.filter((n: any) => !n.read).length);
        }
      } catch {}
    }
    load();
    const id = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [user?.email]);

  return (
    <header className="flex justify-between items-center p-4 bg-[#191B1F] shadow-md relative z-30">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-4">
        {/* Burger for mobile */}
        <button
          aria-label="Open menu"
          className="text-white mr-2"
          onClick={onToggleNav}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            style={{ padding: "15px" }}
            src="/logo.svg"
            alt="Co-Mission Logo"
            width={200}
            height={200}
          />
        </div>
      </div>

      {/* Right Side - Notifications + Connect Wallet */}
      <div className="flex items-center gap-3">
            {/* Notifications button */}
            {user && (
              <a
                href="/notifications"
                className="relative p-3 hover:bg-[#FFBF00]/10 transition-colors duration-200 rounded-lg"
              >
                <Image
                  src="/Bell-removebg-preview.png"
                  alt="Notifications"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {unread}
                  </span>
                )}
              </a>
            )}
        <Wallet className="z-10">
          <div className="text-black px-4 py-2 text-lg font-semibold">
            <ConnectWallet className="text-white bg-[#191B1F] border-2 border-[#FFBF00] rounded-[15px] hover:bg-[#AE8200]">
              <span className="text-l w-36">Connected</span>
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
