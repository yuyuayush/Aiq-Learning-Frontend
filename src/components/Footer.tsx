"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const elements = footer.querySelectorAll(".footer-anim");
    gsap.set(elements, { autoAlpha: 1 });

    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footer,
          start: "top 90%",
        },
      }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#C6A6EB]/40 via-[#B599D5]/40 to-[#49A3E2]/40 text-black pt-20 pb-8"
    >
      {/* Decorative Backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/landingpage/left.png"
          alt="Left Decoration"
          width={500}
          height={500}
          className="absolute left-0 top-1/2 -translate-y-1/2 opacity-30"
        />
        <Image
          src="/landingpage/right.png"
          alt="Right Decoration"
          width={500}
          height={500}
          className="absolute right-10 top-1/3 rotate-12 opacity-30"
        />
        <Image
          src="/landingpage/Hand.png"
          alt="Bottom Hand"
          width={900}
          height={900}
          className="absolute left-1/2 -translate-x-1/2 bottom-0 opacity-50"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] p-10 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* 1️⃣ Brand */}
            <div className="footer-anim">
              <div className="flex items-center mb-4">
                <Image
                  src="/logo/footer.png"
                  alt="AiQ Learning"
                  width={150}
                  height={50}
                  className="rounded-lg"
                />
              </div>
              <p className="text-gray-700 leading-relaxed">
                Learn smarter with AI-powered courses designed to future-proof
                your skills and accelerate your career growth.
              </p>
              <div className="flex gap-4 mt-5 text-gray-600">
                {[FaInstagram].map(
                  (Icon, i) => (
                    <a
                      key={i}
                      href="#"
                      className="hover:text-[#49A3E2] transition text-xl"
                    >
                      <Icon />
                    </a>
                  )
                )}
              </div>
            </div>

            {/* 2️⃣ Quick Links */}
            <div className="footer-anim">
              <h4 className="font-semibold text-lg mb-3">Quick Links</h4>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <Link href="/courses" className="hover:text-[#49A3E2]">
                    Courses
                  </Link>
                </li>

                <li>
                  <Link href="/contact" className="hover:text-[#49A3E2]">
                    Contact
                  </Link>
                </li>

              </ul>
            </div>

            {/* 3️⃣ Newsletter */}
            <div className="footer-anim">
              <h4 className="font-semibold text-lg mb-3">Stay Updated</h4>
              <p className="text-gray-700 mb-4">
                Subscribe for the latest course updates and AI learning tips.
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B599D5]"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#49A3E2] to-[#B599D5] text-white font-semibold px-4 py-2 rounded-md hover:opacity-90 transition"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-300 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-gray-600 text-sm footer-anim">
            <p>© 2025 AiQ Learning. All rights reserved.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <Link href="/terms" className="hover:text-[#49A3E2]">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[#49A3E2]">
                Privacy
              </Link>
              <Link href="/support" className="hover:text-[#49A3E2]">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
