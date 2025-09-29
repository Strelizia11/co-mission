"use client";

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Identity, Avatar, Name, Address, EthBalance } from "@coinbase/onchainkit/identity";
import Image from "next/image";

interface DashboardHeaderProps {
  user: {
    name: string;
    role: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center p-4 bg-[#191B1F] shadow-md relative z-30">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-4">
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

      {/* Right Side - Connect Wallet */}
      <div className="flex items-center">
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
