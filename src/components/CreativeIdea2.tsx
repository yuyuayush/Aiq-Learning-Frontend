"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export default function CreativeIdea2() {
  const sectionRef = useRef<HTMLElement>(null);
  const jumbotronRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const loadTL = gsap.timeline({ defaults: { ease: "power3.out" } });

      loadTL.from(sectionRef.current, { opacity: 0, y: 30, duration: 1.2 });
      loadTL.from(".fade-up", { opacity: 0, y: 30, duration: 0.9, stagger: 0.1 }, "-=0.5");

      if (headingRef.current) {
        const splitMain = new SplitText(headingRef.current, { type: "chars" });
        gsap.from(splitMain.chars, {
          opacity: 0,
          y: 40,
          rotateX: 80,
          duration: 1,
          ease: "back.out(1.8)",
          stagger: 0.03,
        });
      }

      if (textRef.current) {
        gsap.set(textRef.current, { visibility: "hidden" });
        const split = new SplitText(textRef.current, { type: "chars" });

        gsap.from(split.chars, {
          opacity: 0,
          y: 50,
          scale: 0.5,
          rotateY: 80,
          stagger: 0.04,
          duration: 1.1,
          ease: "back.out(1.8)",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 95%",
            onEnter: () => gsap.set(textRef.current, { visibility: "visible" }),
            once: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ✅ Mask animation
  useEffect(() => {
    if (!jumbotronRef.current) return;

    gsap.set(jumbotronRef.current, {
      WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
      maskImage: "radial-gradient(circle at center, black 0%, transparent 70%)",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "0%",
      maskSize: "0%",
    });

    gsap.to(jumbotronRef.current, {
      WebkitMaskSize: "200%",
      maskSize: "200%",
      ease: "power1.out",
      scrollTrigger: {
        trigger: "#creativeIdea2",
        start: "top top",
        end: "bottom center",
        scrub: 1.5,
        pin: true,
      },
    });
  }, []);

  return (
    <section
      id="creativeIdea2"
      ref={sectionRef}
      className="relative min-w-screen bg-gradient-to-br from-white via-[#F8F9FF] to-[#EDEBFF] py-28 overflow-hidden"
    >
      <div
        ref={jumbotronRef}
        className="bg-[linear-gradient(90deg,#6AD0F6_0%,#9CA8F7_50%,#C79BF7_100%)]  relative z-20 text-white py-16 px-6 sm:px-10 lg:px-16 rounded-[3rem] mx-4 sm:mx-10 lg:mx-24 my-10 shadow-2xl overflow-hidden backdrop-blur-lg border border-white/30"
        // style={{
        //   background:
        //     "linear-gradient(135deg, rgba(197,166,235,0.9) 0%, rgba(73,163,226,0.8) 100%)",
        // }}
      >
        <div className="absolute inset-0 bg-white/10 animate-pulse opacity-50" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* LEFT CONTENT */}
          <div className="space-y-6 lg:w-1/2">
            <h1
              ref={headingRef}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight drop-shadow-lg"
            >
              Reimagine your career in the <br />
              <span
                ref={textRef}
                className="inline bg-white px-3 py-1 rounded-md font-bold tracking-tight align-middle"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #49A3E2 0%, #B599D5 50%, #C6A6EB 100%)",
                }}
              >
                AiQ LEARNING
              </span>
            </h1>

            <p className="fade-up text-blue-50 text-base sm:text-lg leading-relaxed font-medium">
              Future-proof your skills with <strong>Personal Plan</strong>. Gain access to real-world
              learning paths designed by experts.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm sm:text-base pt-2 fade-up">
              {[
                { icon: "🤖", text: "Learn AI and more", color: "text-[#D6C0F0]" },
                { icon: "🏆", text: "Earn certifications", color: "text-[#AEE1FF]" },
                { icon: "💬", text: "Practice with Copilot", color: "text-[#FFEBA1]" },
                { icon: "🚀", text: "Advance your career", color: "text-[#C4FFD6]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 hover:translate-x-1 transition-transform">
                  <span className={`${item.color} text-lg`}>{item.icon}</span>
                  <p className="text-gray-50">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 fade-up">
              <button className="relative overflow-hidden bg-white text-[#202230] font-semibold px-8 py-3 rounded-xl mt-4 shadow-md transition hover:scale-105">
                <span className="relative z-10">Learn More</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C6A6EB] to-[#49A3E2] opacity-0 hover:opacity-100 transition-opacity" />
              </button>
              <p className="text-gray-200 text-xs mt-2">Starting at ₹500/month</p>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative w-full lg:w-1/2 h-[300px] sm:h-[380px] lg:h-[420px] fade-up">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C6A6EB]/40 to-[#49A3E2]/30 blur-3xl rounded-full" />
            <Image
              src="/people2.png"
              alt="AI Hero"
              fill
              className="object-contain drop-shadow-2xl z-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
