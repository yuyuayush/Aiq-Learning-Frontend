"use client";

import React, {useEffect, useRef} from "react";
import Image from "next/image";
import Link from "next/link";
import {gsap} from "gsap";
import {SplitText} from "gsap/SplitText";
import {ScrollTrigger} from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(SplitText, ScrollTrigger);
}

const Hero = () => {
    const heroRef = useRef<HTMLElement>(null);
    const floatingShapesRef = useRef<(HTMLDivElement | null)[]>([]);
    const floatingImagesRef = useRef<(HTMLDivElement | null)[]>([]);

    // Floating animation for background elements
    useEffect(() => {
        const allFloatingElements = [
            ...floatingShapesRef.current,
            ...floatingImagesRef.current,
        ];
        allFloatingElements.forEach((el) => {
            if (!el) return;
            // Floating effect
            gsap.to(el, {
                y: "random(-20, 20)",
                x: "random(-15, 15)",
                rotation: "random(-45, 45)",
                duration: "random(3, 6)",
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
            // Breathing/scaling effect
            gsap.to(el, {
                scale: "random(0.8, 1.2)",
                duration: "random(4, 8)",
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
            // Fading effect
            gsap.to(el, {
                opacity: "random(0.3, 0.8)",
                duration: "random(2, 5)",
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
            });
        });
    }, []);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const heading = hero.querySelector(".hero-heading");
        const paragraph = hero.querySelector(".hero-paragraph");
        const ctaElements = hero.querySelectorAll(".hero-cta");
        const logos = hero.querySelectorAll(".hero-logo");
        const heroImage = hero.querySelector(".hero-image");

        const tl = gsap.timeline({
            defaults: {ease: "power3.out"},
        });

        if (heading) {
            const split = new SplitText(heading, {type: "words,chars"}); // Ensure heading is visible by default
            gsap.set(heading, {autoAlpha: 1});
            tl.from(
                split.chars,
                {y: 40, opacity: 0, stagger: 0.03, duration: 0.6},
                "start"
            );
        }

        tl.fromTo(
            paragraph,
            {opacity: 0, y: 30},
            {opacity: 1, y: 0, duration: 1},
            "-=0.4"
        )
            .fromTo(
                ctaElements,
                {opacity: 0, y: 30},
                {opacity: 1, y: 0, stagger: 0.2, duration: 1},
                "-=0.8"
            )
            .fromTo(
                logos,
                {opacity: 0, y: 20},
                {opacity: 1, y: 0, stagger: 0.15, duration: 0.8},
                "-=0.6"
            )
            .fromTo(
                heroImage,
                {opacity: 0, x: 100, scale: 0.95},
                {
                    // opacity: 0,
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 1.5,
                    ease: "power3.inOut",
                },
                "start+=0.2"
            );

        // Add hover effects for logos
        const logoElements = hero.querySelectorAll(".hero-logo");
        logoElements.forEach((logo) => {
            logo.addEventListener("mouseenter", () => {
                gsap.to(logo, {
                    scale: 1.1,
                    y: -5,
                    duration: 0.3,
                    ease: "power2.out",
                });
            });
            logo.addEventListener("mouseleave", () => {
                gsap.to(logo, {scale: 1, y: 0, duration: 0.3, ease: "power2.out"});
            });
        });

        // Add hover effects for floating shapes
        const shapeElements = heroRef.current.querySelectorAll(".floating-element");
        shapeElements.forEach((shape) => {
            shape.addEventListener("mouseenter", () => {
                gsap.to(shape, {scale: 1.5, duration: 0.3, ease: "power2.out"});
            });
            shape.addEventListener("mouseleave", () => {
                // The yoyo effect on the main animation will return it to its natural scale
                gsap.to(shape, {scale: 1, duration: 0.3, ease: "power2.out"});
            });
        });

        // Animate border radius when scrolled past 70% of the hero section
        // Animate only the bottom border radii to a small rounded value when scrolled past 70% of the hero section
        const maxRadius = 250; // px, for a subtle rounding
        gsap.set(hero, {
            borderTopLeftRadius: "0px",
            borderTopRightRadius: "0px",
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
        });
        ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "70% top", // 70% through hero section
            scrub: true,
            onUpdate: (self) => {
                // Animate only the bottom corners from 0px to maxRadius px as you reach 70%
                const progress = self.progress;
                const radius = progress * maxRadius;
                gsap.to(hero, {
                    borderBottomLeftRadius: `${radius}px`,
                    borderBottomRightRadius: `${radius}px`,
                    borderTopLeftRadius: "0px",
                    borderTopRightRadius: "0px",
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            },
        });
    }, []);

    return (
        <section
            id="hero"
            ref={heroRef}
            className="min-h-screen w-full bg-white pt-10 md:pt-4 lg:pt-8 relative overflow-hidden"
            style={{borderRadius: 0}}
        >
            {/* Floating background shapes */}
            {/* Floating background images */}
            <div
                ref={(el) => {
                    floatingImagesRef.current[0] = el;
                }}
                className="floating-element absolute top-[15%] right-[35%] w-28 h-28 md:w-40 md:h-40 z-0 opacity-50"
            >
                <Image
                    src="/props/14.png"
                    alt="float"
                    fill
                    className="object-contain"
                />
            </div>
            <div
                ref={(el) => {
                    floatingImagesRef.current[1] = el;
                }}
                className="floating-element absolute top-[25%] right-[5%] w-24 h-24 md:w-36 md:h-36 z-0 opacity-50"
            >
                <Image
                    src="/props/15.png"
                    alt="float"
                    fill
                    className="object-contain"
                />
            </div>
            <div
                ref={(el) => {
                    floatingImagesRef.current[2] = el;
                }}
                className="floating-element absolute bottom-[40%] right-[40%] w-24 h-24 md:w-32 md:h-32 z-0 opacity-50"
            >
                <Image
                    src="/props/16.png"
                    alt="float"
                    fill
                    className="object-contain"
                />
            </div>
            <div
                ref={(el) => {
                    floatingImagesRef.current[3] = el;
                }}
                className="floating-element absolute bottom-[15%] right-[10%] w-32 h-32 md:w-48 md:h-48 z-0 opacity-50"
            >
                <Image
                    src="/props/18.png"
                    alt="float"
                    fill
                    className="object-contain"
                />
            </div>
            <div className="absolute inset-0 z-0">
                {[
                    {
                        shape: "circle",
                        color: "bg-blue-200",
                        size: "w-16 h-16",
                        top: "10%",
                        left: "5%",
                    },
                    {
                        shape: "plus",
                        color: "text-indigo-200",
                        size: "w-12 h-12",
                        top: "15%",
                        left: "80%",
                    },
                    {
                        shape: "circle",
                        color: "bg-indigo-100",
                        size: "w-32 h-32",
                        top: "60%",
                        left: "90%",
                    },

                    {
                        shape: "circle",
                        color: "bg-blue-100",
                        size: "w-10 h-10",
                        top: "85%",
                        left: "50%",
                    },
                    {
                        shape: "plus",
                        color: "text-indigo-100",
                        size: "w-28 h-28",
                        top: "30%",
                        left: "45%",
                    },
                    // Adding more smaller shapes
                    {
                        shape: "plus",
                        color: "text-blue-100",
                        size: "w-12 h-12",
                        top: "5%",
                        left: "30%",
                    },
                    {
                        shape: "circle",
                        color: "bg-indigo-50",
                        size: "w-14 h-14",
                        top: "80%",
                        left: "75%",
                    },
                    {
                        shape: "plus",
                        color: "text-blue-200",
                        size: "w-16 h-16",
                        top: "50%",
                        left: "20%",
                    },
                    {
                        shape: "circle",
                        color: "bg-blue-100",
                        size: "w-20 h-20",
                        top: "90%",
                        left: "25%",
                    },
                    {
                        shape: "plus",
                        color: "text-indigo-100",
                        size: "w-8 h-8",
                        top: "40%",
                        left: "95%",
                    },
                    {
                        shape: "circle",
                        color: "bg-indigo-200",
                        size: "w-24 h-24",
                        top: "5%",
                        left: "60%",
                    },
                ].map((item, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            floatingShapesRef.current[index] = el;
                        }}
                        className={`floating-element absolute ${item.size} opacity-50`}
                        style={{top: item.top, left: item.left}}
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
                                <path
                                    d="M50 10V90"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M10 50H90"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                />
                            </svg>
                        )}
                    </div>
                ))}
            </div>

            <div
                className="w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-16 xl:px-20 2xl:px-24 py-8 md:py-12 lg:py-16 relative z-10">
                <div className="flex flex-col lg:flex-row items-stretch h-[80vh] min-h-[600px] w-full">
                    {/* Left Content - 50% */}
                    <div
                        className="flex-1 flex flex-col justify-center px-2 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
                        <h1 className="hero-heading text-3xl sm:text-4xl md:text-5xl font-hendrix-regular lg:text-6xl xl:text-7xl text-gray-900 leading-tight mb-4 md:mb-6">
                            Take The First
                            <br/>
                            Step towards
                            <br/>
                            Your{" "}
                            <span
                                className="text-[#33507A]  font-fredoka-regular font-black bg-[#DDD5F4] px-3 py-1 rounded-lg">
                FUTURE
              </span>
                        </h1>

                        <p className="hero-paragraph font-hendrix-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#3A5B8C8A] mb-4 md:mb-5 leading-relaxed">
                            every lesson here brings you closer to your goals.
                        </p>

                        {/* Get Started Button */}
                        <div
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
                            <Link
                                href="/login"
                                className="hero-cta flex items-center gap-2 px-2 py-2 rounded-full bg-[#46649A] shadow-lg hover:bg-[#33507A] transition-colors"
                                style={{width: "fit-content"}}
                            >
                <span className="text-white font-semibold text-lg md:text-xl px-8 py-3">
                  Get Started
                </span>
                                <span
                                    className="flex items-center justify-center rounded-full bg-white w-10 h-10 md:w-12 md:h-12 shadow">
                  {/* Arrow icon from react-icons */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="w-5 h-5 text-[#46649A]"
                                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
                            </Link>

                            {/* Stats */}
                            <div className="hero-cta flex items-center gap-5 md:gap-6">
                                <div className="flex -space-x-5">
                                    <span
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#E0E0E0] inline-block"></span>
                                    <span
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#B0B0B0] inline-block"></span>
                                    <span
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#6E6E6E] inline-block"></span>
                                </div>
                                <div className="flex flex-col justify-center">
                  <span className="font-bold text-[#46649A] text-2xl md:text-3xl lg:text-4xl">
                    500K+
                  </span>
                                    <span className="text-[#8CA0C3] text-base md:text-lg font-medium -mt-1">
                    Active Learners
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* AI Tools Section */}
                        <div className="flex flex-wrap items-center gap-8 md:gap-12 lg:gap-16 opacity-90 mt-2 md:mt-3">
                            <div className="flex items-center gap-8 md:gap-12 lg:gap-16">
                                <Image
                                    src="/logo/Copilotlogo.png"
                                    alt="Copilot Logo"
                                    width={140}
                                    height={140}
                                    className="hero-logo w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 object-contain"
                                />
                                <Image
                                    src="/logo/ChatGptLogo.png"
                                    alt="ChatGPT Logo"
                                    width={140}
                                    height={140}
                                    className="hero-logo w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 object-contain"
                                />
                                <Image
                                    src="/logo/Claudelogo.png"
                                    alt="Claude Logo"
                                    width={140}
                                    height={140}
                                    className="hero-logo w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Image - 50% */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="hero-image relative w-full h-full">
                            <Image
                                src="/landingpage/heroImage.png"
                                alt="Learning community illustration"
                                fill
                                className="w-full h-full object-contain"
                                priority
                            />
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Hero;
