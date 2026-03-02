"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { RiLoginBoxLine, RiMenuLine, RiCloseLine } from "react-icons/ri";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Why", href: "/#why" },
    { name: "About", href: "/#about" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xs px-2 z-50">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-between border border-slate-700 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[12px] text-white shadow-sm"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
  <div className="w-7 aspect-square rounded-full bg-black flex items-center justify-center">
    <Image
      src="/SVGIcon.svg"
      alt="Logo"
      width={26}
      height={24}
      className="object-contain"
      priority
    />
  </div>
</Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-white/65 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] text-[10px]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Login Icon */}
        <div className="hidden md:flex items-center">
          <Link
            href="/login"
            className="text-white/65 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          >
            <RiLoginBoxLine size={16} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <RiCloseLine size={18} /> : <RiMenuLine size={18} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 bg-black/95 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 text-[13px] text-white"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:text-white transition"
              >
                {link.name}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>
              Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}