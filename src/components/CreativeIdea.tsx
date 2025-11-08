"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export default function CreativeIdea() {
  const textRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const jumbotronRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const ctx = gsap.context(() => {
      const loadTL = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      loadTL.from(sectionRef.current, {
        opacity: 0,
        y: 30,
        duration: 1.2,
      });

      loadTL.from(
        ".float-img",
        {
          opacity: 0,
          scale: 0.8,
          y: 40,
          rotate: 10,
          duration: 1,
          ease: "back.out(1.7)",
          stagger: 0.3,
        },
        "-=0.8" // Start slightly before the previous tween ends
      );

      // 3. 🌟 Paragraph and icons fade-up animation (ON-LOAD)
      loadTL.from(
        ".fade-up",
        {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: "power2.out",
          stagger: 0.1,
        },
        "-=0.5" // Start slightly before the previous tween ends
      );


      // --- SCROLL-TRIGGERED ANIMATIONS ---

      // 4. 🌟 Main heading split animation (ON-SCROLL)
      if (headingRef.current) {
        const splitMain = new SplitText(headingRef.current, {
          type: "chars", // Changed to chars for the effect you specified
        });

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
            onEnter: () => {
              gsap.set(textRef.current, { visibility: "visible" });
            },
            once: true,
          },
        });
      }

      // 6. 🌟 Jumbotron parallax effect (ON-SCROLL, Continuous)
      if (jumbotronRef.current) {
        gsap.to(jumbotronRef.current, {
          y: -50,
          scale: 0.9,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ... (rest of the component JSX remains the same)


  return (
    <section
      ref={sectionRef}
      className="relative min-w-screen bg-gradient-to-br from-white via-[#F8F9FF] to-[#EDEBFF] py-28 overflow-hidden"
    >
      {/* Floating images */}
      {/* <Image
        src="/landingpage/ctamain.png"
        alt="Floating AI"
        width={260}
        height={260}
        className=" absolute inset-0 "
      /> */}
      {/* <Image
        src="/people2.png"
        alt="Floating person"
        width={180}
        height={180}
        className="float-img absolute bottom-0 left-12 sm:left-24 rotate-[-6deg] drop-shadow-xl z-10 hover:scale-105 transition-transform duration-500"
      /> */}

      {/* MAIN JUMBOTRON */}
      <div
        ref={jumbotronRef}
        className="relative z-20 text-white py-16  px-6 sm:px-10 lg:px-16 rounded-[3rem] mx-4 sm:mx-10 lg:mx-24 my-10 shadow-2xl overflow-hidden backdrop-blur-lg border border-white/30"
        style={{
          background:
            "linear-gradient(135deg, rgba(197,166,235,0.9) 0%, rgba(73,163,226,0.8) 100%)",
        }}
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
              Future-proof your skills with <strong>Personal Plan</strong>. Gain
              access to real-world learning paths designed by experts.
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm sm:text-base pt-2 fade-up">
              {[
                { icon: "🤖", text: "Learn AI and more", color: "text-[#D6C0F0]" },
                { icon: "🏆", text: "Earn certifications", color: "text-[#AEE1FF]" },
                { icon: "💬", text: "Practice with Copilot", color: "text-[#FFEBA1]" },
                { icon: "🚀", text: "Advance your career", color: "text-[#C4FFD6]" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 hover:translate-x-1 transition-transform"
                >
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
              <p className="text-gray-200 text-xs mt-2">
                Starting at ₹500/month
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT IMAGE */}
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
