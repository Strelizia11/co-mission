"use client";

import { useEffect, useState } from "react";
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

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <main className="bg-white text-black min-h-screen">
      {/* Header with Wallet Connection for Logged-in Users */}
      {user && (
        <header className="flex justify-between items-center p-4 bg-[#191B1F] shadow-md">
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
          <nav className="flex gap-4">
            <Wallet className="z-10">
              <div className="text-black px-4 py-2 text-lg font-semibold">
                <ConnectWallet className="text-white bg-[#191B1F] border-2 border-[#FFBF00] rounded-[15px] hover:bg-[#AE8200]">
                  <span className="text-l w-36">Connect Wallet</span>
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
          </nav>
        </header>
      )}

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen bg-[#FFBF00] px-6">
        <h1
          className={`text-5xl md:text-6xl font-extrabold mb-6 text-black transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {user ? (
            <>
              Welcome back, <span className="text-white">{user.name}</span>!
            </>
          ) : (
            <>
              Welcome to <span className="text-white">Co-Mission</span>
            </>
          )}
        </h1>
        <p
          className={`text-lg md:text-xl text-black max-w-2xl transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {user ? (
            <>
              Ready to {user.role === 'employer' ? 'post missions' : 'find work'}? 
              Let's get started with your {user.role} journey.
            </>
          ) : (
            <>
              Connect, explore, and grow — a platform made for you.
            </>
          )}
        </p>
        <div
          className={`mt-8 flex gap-4 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {user ? (
            <>
              <Link
                href="/"
                className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#333] transition"
              >
                Go to App
              </Link>
              <Link
                href="/dashboard"
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <Link
              href="/auth/register"
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#333] transition"
            >
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Showcase Section */}
      <section className="px-6 py-20 bg-white">
        <h2
          className={`text-3xl font-bold text-center mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Explore Our Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((i, idx) => (
            <div
              key={i}
              className={`bg-[#FFBF00] rounded-lg shadow-lg overflow-hidden flex items-center justify-center h-64 transition-all duration-700 delay-${
                idx * 200 + 300
              } ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <Image
                src={`/placeholder-${i}.jpg`}
                alt={`Feature ${i}`}
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="px-6 py-20 bg-[#191B1F] text-center text-white">
          <h2
            className={`text-3xl font-bold mb-6 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Ready to Get Started?
          </h2>
          <div
            className={`transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              href="/auth/register"
              className="bg-[#FFBF00] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#e6ac00] transition"
            >
              Join Now
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
