"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CtaHome = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const circleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });

    gsap.fromTo(
      content.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
        scrollTrigger: {
          trigger: content,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="w-full relative overflow-hidden">
      {/* Upper Section with Background Color and decorative image */}
      <div className="h-64 md:h-80 w-full relative z-0 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-8 h-8 bg-white rounded-full opacity-30"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 border border-white rounded-full"></div>
        </div>
        {/* Top right decorative background image */}
        <Image
          src="/landingpage/ctaprop1.png"
          alt="Decorative background"
          width={400}
          height={400}
          className="absolute top-0 right-0 w-[200px] md:w-[300px] lg:w-[400px] h-auto opacity-70 z-0 pointer-events-none select-none"
          priority
        />
      </div>

      {/* Lower Section - White Background */}
      <div className="bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left side - Image positioned to overlap both sections */}
            <div
              ref={imageRef}
              className="lg:w-1/2 relative -mt-32 md:-mt-40 lg:-mt-56 flex justify-center"
            >
              <div className="relative z-10">
                <Image
                  src="/landingpage/ctamain.png"
                  alt="Learning illustration"
                  width={900}
                  height={800}
                  className="w-[450px] md:w-[600px] lg:w-[700px] object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div ref={contentRef} className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Advance your personal and professional development with{" "}
                <span className="text-purple-600">Aiq Learning</span>.
              </h2>

              <div className="pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 
                           text-white font-semibold px-8 py-4 rounded-full 
                           transition-all duration-300 transform hover:scale-105 
                           shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaHome;
