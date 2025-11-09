"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
// Import ScrollToPlugin if you plan to use the scroll function
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { handleScrollTo } from "./Hero2";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin); // Register ScrollToPlugin
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
                "-=0.8"
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
                "-=0.5"
            );


            // --- SCROLL-TRIGGERED ANIMATIONS ---

            // 4. 🌟 Main heading split animation (ON-SCROLL)
            if (headingRef.current) {
                const splitMain = new SplitText(headingRef.current, {
                    type: "chars",
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


    return (
        <section
            ref={sectionRef}
            className="relative min-w-screen  py-28 overflow-hidden"
        >
            {/* MAIN CARD */}
            <div
                ref={jumbotronRef}
                className="bg-[linear-gradient(90deg,#6AD0F6_0%,#9CA8F7_50%,#C79BF7_100%)] relative z-20 text-white py-12 lg:py-16 px-8 sm:px-12 lg:px-20 rounded-[3rem] mx-4 sm:mx-10 lg:mx-24 shadow-2xl overflow-hidden backdrop-blur-lg border border-white/30"
            >
                {/* Overlay glow */}
                <div className="absolute inset-0 bg-white/10 animate-pulse opacity-50" />

                {/* CONTENT LAYOUT */}
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 max-w-7xl mx-auto">
                    {/* LEFT: TEXT CONTENT */}
                    <div className="flex flex-col justify-center space-y-6 lg:w-[55%] text-left">
                        <h1
                            ref={headingRef}
                            className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-tight drop-shadow-lg"
                        >
                            Reimagine your
                            <br />
                            career
                            in the <br />
                            <span
                                ref={textRef}
                                className="inline bg-white px-3 py-1 sm:mt-3 mt-5 rounded-md font-bold tracking-tight align-middle"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(90deg, #49A3E2 0%, #B599D5 50%, #C6A6EB 100%)",
                                }}
                            >
                                AiQ LEARNING
                            </span>
                        </h1>

                        <p className="fade-up text-blue-50  sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium pt-10 mt-10">
                            Future-proof your skills with **Personal Plan**. Gain
                            access to real-world learning paths designed by experts.
                        </p>

                        {/* FEATURES (2 columns) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:text-lg sm:text-base pt-2 fade-up">
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

                        {/* BUTTONS */}
                        
                    </div>

                    {/* RIGHT: IMAGE */}
                    <div className="relative w-full lg:w-[40%] h-[280px] sm:h-[360px] lg:h-[420px] fade-up">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#C6A6EB]/40 to-[#49A3E2]/30 blur-3xl rounded-3xl" />
                        <Image
                            src="/landingpage/ctamain.png"
                            alt="AI Hero"
                            fill
                            className="object-contain drop-shadow-2xl z-10 rounded-3xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    );

}