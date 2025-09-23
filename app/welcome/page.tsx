"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <main className="bg-white text-black min-h-screen">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen bg-[#FFBF00] px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 text-black"
        >
          Welcome to <span className="text-white">Co-Mission</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg md:text-xl text-black max-w-2xl"
        >
          Connect, explore, and grow — a platform made for you.
        </motion.p>
        <motion.button
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
        <div className="mt-8 flex gap-4">
          <Link
            href="/auth/register"
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#333] transition"
          >
            Get Started
          </Link>
        </div>
        </motion.button>
      </section>

      {/* Showcase / Images Section */}
      <section className="px-6 py-20 bg-white">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Explore Our Features
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Example picture containers */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-[#FFBF00] rounded-lg shadow-lg overflow-hidden flex items-center justify-center h-64"
            >
              {/* Replace these placeholders with real images */}
              <Image
                src={`/placeholder-${i}.jpg`}
                alt={`Feature ${i}`}
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-6 py-20 bg-[#191B1F] text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl font-bold mb-6"
        >
          Ready to Get Started?
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link
            href="/auth/register"
            className="bg-[#FFBF00] text-black px-8 py-4 rounded-lg font-semibold hover:bg-[#e6ac00] transition"
          >
            Join Now
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
