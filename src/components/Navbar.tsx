"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { NAVLINKS, tel } from "@/lib/constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".nav-item",
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2,
        }
      );

      ScrollTrigger.create({
        trigger: "body",
        start: "top -50px",
        end: "bottom bottom",
        onUpdate: (self) => {
          const isScrolledNow = self.progress > 0;
          setIsScrolled(isScrolledNow);

          if (isScrolledNow) {
            gsap.to(navRef.current, {
              scale: 0.9,
              y: 16,
              borderRadius: "50px",
              duration: 0.25,
              ease: "power2.out",
              transformOrigin: "center top",
            });
          } else {
            gsap.to(navRef.current, {
              scale: 1,
              y: 0,
              borderRadius: "0px",
              duration: 0.25,
              ease: "power2.out",
              transformOrigin: "center top",
            });
          }
        },
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      setIsMobileMenuOpen(true);
      // Ensure menu is visible before animation
      gsap.set(mobileMenuRef.current, { display: "block", opacity: 0, y: -20 });
      gsap.to(mobileMenuRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        ".mobile-nav-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.1,
        }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setIsMobileMenuOpen(false);
        },
      });
    }
  };

  const closeMobileMenu = () => {
    gsap.to(mobileMenuRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setIsMobileMenuOpen(false);
      },
    });
  };

  return (
    <>
     <nav
  ref={navRef}
  className={`fixed top-0 w-full z-[999] transition-all duration-300 ${
    isScrolled
      ? "bg-white/30 backdrop-blur-lg border-b border-gray-200/30 shadow-lg"
      : "bg-white/20 backdrop-blur-lg border-b border-gray-200/50"
  }`}
  style={{ transformOrigin: "center top" }}
>
  <div className="max-w-[1400px] mx-auto px-6 lg:px-0 py-2 flex items-center justify-between min-h-[70px]">
    {/* LEFT: Logo */}
    <div className="flex-shrink-0">
      <Link href="/" className="flex items-center">
        <img
          src="/logo/logo.png"
          alt="logo"
          className="h-12 w-auto object-contain"
        />
      </Link>
    </div>

    {/* CENTER: Search Bar */}
    <div className="hidden lg:flex flex-1 justify-center px-6">
      <div className="relative w-[480px] group">
        <input
          type="search"
          placeholder="Search for courses..."
          aria-label="Search"
          className="w-full px-5 py-3 rounded-2xl border border-gray-300 bg-white/90 text-base text-gray-800 
          focus:outline-none focus:ring-4 focus:ring-purple-300/50 focus:border-purple-400 
          transition-all duration-300 shadow-sm group-hover:shadow-md"
        />
        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors" />
      </div>
    </div>

    {/* RIGHT: Auth Buttons */}
    <div className="hidden lg:flex items-center space-x-5">
      {/* Sign Up */}
      <Link
        href="/register"
        className="px-6 py-3 rounded-xl font-semibold text-white text-lg
        bg-gradient-to-r from-[#7C3AED] via-[#9F7AEA] to-[#C084FC]
        shadow-[0_4px_15px_rgba(156,81,255,0.3)]
        hover:shadow-[0_6px_20px_rgba(156,81,255,0.5)]
        hover:scale-105 active:scale-95 transition-all duration-300"
      >
        Sign Up
      </Link>

      {/* Sign In Dropdown */}
      <div className="relative group">
        <button
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3A5B8C] to-[#4E6FA8] 
          text-white font-semibold text-lg 
          shadow-[0_4px_15px_rgba(58,91,140,0.25)]
          hover:shadow-[0_6px_18px_rgba(58,91,140,0.35)]
          hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Sign In
        </button>

        {/* Dropdown Menu */}
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border 
        opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            <Link
              href="/login"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Student Login
            </Link>
            <Link
              href="/login/instructor"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Instructor Login
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* MOBILE: Menu Button */}
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden p-2 text-black hover:text-black transition-colors duration-300"
      aria-label="Toggle mobile menu"
    >
      {isMobileMenuOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <Menu className="h-6 w-6" />
      )}
    </button>
  </div>

  {/* MOBILE MENU */}
  <div
    ref={mobileMenuRef}
    className={`lg:hidden absolute top-full left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-primary/50 shadow-lg ${
      isMobileMenuOpen ? "block" : "hidden"
    }`}
  >
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col space-y-4">
        {/* Mobile Search */}
        <div className="pb-4 border-b border-primary/50">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search for courses..."
              aria-label="Search"
              className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {NAVLINKS.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            onClick={closeMobileMenu}
            className={`text-black hover:text-black transition-all duration-300 py-2 text-lg ${
              pathname === link.path
                ? "font-semibold border-l-4 border-black pl-4"
                : ""
            }`}
          >
            {link.name}
          </Link>
        ))}

        {/* Auth Buttons */}
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
          <Link
            href="/register"
            onClick={closeMobileMenu}
            className="block w-full text-center px-6 py-3 bg-[#8A38F5] text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className="block w-full text-center px-6 py-2 bg-[#3A5B8C] text-white rounded-lg font-semibold hover:bg-[#24406c] transition-colors"
          >
            Student Login
          </Link>
          <Link
            href="/login/instructor"
            onClick={closeMobileMenu}
            className="block w-full text-center px-6 py-2 border-2 border-[#3A5B8C] text-[#3A5B8C] rounded-lg font-semibold hover:bg-[#3A5B8C] hover:text-white transition-colors"
          >
            Instructor Login
          </Link>
        </div>
      </div>
    </div>
  </div>
</nav>

    </>
  );
};

export default Navbar;
