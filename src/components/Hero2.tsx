"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export const handleScrollTo = (where: string) => {
  gsap.to(window, {
    duration: 1.5, // Scroll duration
    scrollTo: `#${where}`, // The ID of your courses section
    ease: "power2.inOut",
  });
};

export default function Hero2() {
  const aiqRef = useRef<HTMLSpanElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Refs for floating elements
  const floatingShapesRef = useRef<(HTMLDivElement | null)[]>([]);
  const floatingImagesRef = useRef<(HTMLDivElement | null)[]>([]);

  // === Floating Background Animation ===
  useEffect(() => {
    const allFloatingElements = [
      ...floatingShapesRef.current,
      ...floatingImagesRef.current,
    ];
    allFloatingElements.forEach((el) => {
      if (!el) return;
      // Combining all floating, scaling, and fading into one continuous animation
      gsap.to(el, {
        y: "random(-20, 20)",
        x: "random(-15, 15)",
        rotation: "random(-45, 45)",
        scale: "random(0.8, 1.2)",
        opacity: "random(0.3, 0.8)",
        duration: "random(4, 8)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Add hover effects
      el.addEventListener("mouseenter", () => {
        gsap.to(el, { scale: 1.5, duration: 0.3, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
      });
    });
  }, []);

  // ---

  // === Main GSAP Entrance and ScrollTrigger Logic ===
  useEffect(() => {
    const ctx = gsap.context(() => {
      const heading = sectionRef.current?.querySelector(".hero2-heading");
      const headingInner = sectionRef.current?.querySelector(".hero2-heading-inner");
      const section = sectionRef.current;

      // 1. Initial Hero Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // a) Heading SplitText Animation
      if (heading && headingInner) {
        gsap.set(heading, { autoAlpha: 0 });
        const split = new SplitText(headingInner, { type: "words,chars" });
        gsap.set(heading, { autoAlpha: 1 }); // Make container visible once split
        tl.from(
          split.chars,
          { y: 40, opacity: 0, stagger: 0.03, duration: 0.6 },
          "start"
        );
      }


      tl.fromTo(
        aiqRef.current,
        { clipPath: "inset(0 50% 0 50%)", autoAlpha: 0 },
        { clipPath: "inset(0 0% 0 0%)", autoAlpha: 1, duration: 1.2, ease: "power3.out" },
        "start+=2"
      );

      // c) Left side content fade-up
      tl.from(leftRef.current?.children, {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        ease: "power2.out",
        duration: 0.8,
      }, "-=0.8");

      // d) Right side image slide-in
      tl.from(rightRef.current, {
        x: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      }, "-=1.0");

      // === ScrollTrigger Border Radius Animation ===
      if (section) {
        const maxRadius = 250;
        gsap.set(section, {
          borderBottomLeftRadius: "0px",
          borderBottomRightRadius: "0px",
        });
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "70% top",
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const radius = progress * maxRadius;
            gsap.to(section, {
              borderBottomLeftRadius: `${radius}px`,
              borderBottomRightRadius: `${radius}px`,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);






  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#EDEBFF] via-[#F8F9FF] to-white py-24 px-6 sm:px-12 lg:px-20"
      style={{ borderRadius: 0 }} // Ensure initial state is 0 for ScrollTrigger
    >
      {/* Background gradient orbs */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-[#B599D5]/40 to-[#49A3E2]/30 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-tr from-[#C6A6EB]/50 to-[#B599D5]/30 rounded-full blur-3xl opacity-50 animate-pulse"></div>

      {/* Floating background images */}
      <div
        ref={(el) => { floatingImagesRef.current[0] = el; }}
        className="floating-element absolute top-[15%] right-[35%] w-28 h-28 md:w-40 md:h-40 z-0 opacity-50 hidden md:block"
      >
        <Image src="/props/14.png" alt="float" fill className="object-contain" />
      </div>
      <div
        ref={(el) => { floatingImagesRef.current[1] = el; }}
        className="floating-element absolute top-[25%] right-[5%] w-24 h-24 md:w-36 md:h-36 z-0 opacity-50"
      >
        <Image src="/props/15.png" alt="float" fill className="object-contain" />
      </div>
      <div
        ref={(el) => { floatingImagesRef.current[2] = el; }}
        className="floating-element absolute bottom-[40%] right-[40%] w-24 h-24 md:w-32 md:h-32 z-0 opacity-50 hidden lg:block"
      >
        <Image src="/props/16.png" alt="float" fill className="object-contain" />
      </div>
      <div
        ref={(el) => {floatingImagesRef.current[3] = el; }}
        className="floating-element absolute bottom-[15%] right-[10%] w-32 h-32 md:w-48 md:h-48 z-0 opacity-50"
      >
        <Image src="/props/18.png" alt="float" fill className="object-contain" />
      </div>

      {/* Floating Background Shapes */}
      <div className="absolute inset-0 z-0">
        {[
          { shape: "circle", color: "bg-blue-200", size: "w-16 h-16", top: "10%", left: "5%" },
          { shape: "plus", color: "text-indigo-200", size: "w-12 h-12", top: "15%", left: "80%" },
          { shape: "circle", color: "bg-indigo-100", size: "w-32 h-32", top: "60%", left: "90%" },
          { shape: "circle", color: "bg-blue-100", size: "w-10 h-10", top: "85%", left: "50%" },
          { shape: "plus", color: "text-indigo-100", size: "w-28 h-28", top: "30%", left: "45%" },
          { shape: "plus", color: "text-blue-100", size: "w-12 h-12", top: "5%", left: "30%" },
          { shape: "circle", color: "bg-indigo-50", size: "w-14 h-14", top: "80%", left: "75%" },
          { shape: "plus", color: "text-blue-200", size: "w-16 h-16", top: "50%", left: "20%" },
          { shape: "circle", color: "bg-blue-100", size: "w-20 h-20", top: "90%", left: "25%" },
          { shape: "plus", color: "text-indigo-100", size: "w-8 h-8", top: "40%", left: "95%" },
          { shape: "circle", color: "bg-indigo-200", size: "w-24 h-24", top: "5%", left: "60%" },
        ].map((item, index) => (
          <div
            key={index}
            ref={(el) => { floatingShapesRef.current[index] = el; }}
            className={`floating-element absolute ${item.size} opacity-50`}
            style={{ top: item.top, left: item.left }}
          >
            {item.shape === "circle" ? (
              <div className={`w-full h-full rounded-full ${item.color}`}></div>
            ) : (
              <svg
                className={`w-full h-full ${item.color}`}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50 10V90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                <path d="M10 50H90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        {/* LEFT SIDE CONTENT */}
        <div ref={leftRef} className="flex-1 text-center lg:text-left">
          <h1 className="hero2-heading text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight text-[#202230] mb-6">
            Unlock Your <br />
            <span className="bg-gradient-to-r from-[#49A3E2] via-[#B599D5] to-[#C6A6EB] bg-clip-text text-transparent">
              Creative Potential
            </span>{" "}
            <span className="hero2-heading-inner">with</span>{" "}
            <span
              ref={aiqRef}
              className="inline-block text-[#3B5480] bg-[#EBE5FB] px-3 py-1 rounded-lg"
              style={{ display: "inline-block", clipPath: "inset(0 50% 0 50%)" }}
            >
              AiQ Learning
            </span>
          </h1>

          <p className="text-gray-600 text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
            Learn next-gen skills — from AI and design thinking to coding and
            communication — guided by intelligent learning paths designed for
            the future of work.
          </p>


          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/register">

              <button className="relative overflow-hidden px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#49A3E2] via-[#B599D5] to-[#C6A6EB] shadow-lg hover:shadow-xl hover:scale-105 transition">
                Start Learning
              </button>
            </Link>
            <button
              onClick={() => handleScrollTo("course-section")}
              className="px-8 py-3 rounded-xl border border-[#C6A6EB] text-[#3B5480] font-semibold bg-white hover:bg-[#F1ECFE] transition">
              Explore Courses
            </button>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div ref={rightRef} className="flex-1 relative">
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[550px]">
            <Image
              src="/landingpage/heroImage.png"
              alt="Learning Illustration"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Glow behind image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#B599D5]/30 to-[#49A3E2]/30 blur-3xl opacity-70 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}