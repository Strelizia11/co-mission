"use client";

import { useRouter } from "next/navigation";

export default function RegisterChoicePage() {
  const router = useRouter();

  const handleChoice = (role: "employer" | "freelancer") => {
    router.push(`/auth/register/form?role=${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-md rounded-lg p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-6 text-black">
          Join as a
        </h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleChoice("employer")}
            className="w-full py-3 text-lg font-medium bg-[#FFBF00] text-black rounded hover:bg-[#AE8200] transition"
          >
            I’m an Employer
          </button>
          <button
            onClick={() => handleChoice("freelancer")}
            className="w-full py-3 text-lg font-medium border-2 border-[#FFBF00] text-black rounded hover:bg-gray-200 transition"
          >
            I’m a Freelancer
          </button>
        </div>
      </div>
    </div>
  );
}
