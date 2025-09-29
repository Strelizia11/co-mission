"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterChoicePage() {
  const router = useRouter();

  const handleChoice = (role: "employer" | "freelancer") => {
    router.push(`/auth/register/form?role=${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-2xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-black">
          Join Co-Mission as:
        </h1>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-4">
          <button
            onClick={() => handleChoice("employer")}
            className="flex-1 flex flex-col items-center justify-center py-8 px-8 text-2xl md:text-3xl font-semibold border-4 border-gray-200 hover:border-[#FFBF00] text-black rounded-xl shadow-lg bg-white hover:bg-[#FFBF00] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#FFBF00]/40"
          >
            <span className="text-5xl mb-3">🏢</span>
            Employer
            <span className="mt-2 text-sm md:text-base font-normal text-black/70">Post jobs, manage projects, and hire top freelancers.</span>
          </button>
          <button
            onClick={() => handleChoice("freelancer")}
            className="flex-1 flex flex-col items-center justify-center py-8 px-8 text-2xl md:text-3xl font-semibold border-4 border-gray-200 hover:border-[#FFBF00] text-black rounded-xl shadow-lg bg-white hover:bg-[#FFBF00] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#FFBF00]/40"
          >
            <span className="text-5xl mb-3">💼</span>
            Freelancer
            <span className="mt-2 text-sm md:text-base font-normal text-black/70">Find work, grow your skills, and earn securely.</span>
          </button>
        </div>
        <p className="mt-8 text-base text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#FFBF00] hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
