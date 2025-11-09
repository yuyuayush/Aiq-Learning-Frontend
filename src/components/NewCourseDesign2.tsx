"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Check } from "lucide-react";
import { handleScrollTo } from "./Hero2";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

const courses = [
    {
        img: "/thumbnail2.png",
        title: "Introduction to AI",
        desc: "Course Duration: 1 to 2 weeks",
        price: "$29.99",
        modules: [
            "Foundations of AI",
            "Basics of Machine Learning & Data",
            "Generative AI & LLMs",
            "Prompt Engineering",
            "AI Workflows & Tools",
            "Responsible AI & Future of Work",
            "Mini Project",
        ],
    },
    {
        img: "/thumbnail3.jpg",
        title: "Microsoft Copilot 365",
        desc: "Course Duration: 2 to 4 weeks",
        price: "$29.99",
        modules: [
            "Introduction to Copilot 365",
            "Effective Prompting",
            "Copilot in Word",
            "Copilot in Excel",
            "Copilot in PowerPoint",
            "Copilot in Outlook & Teams",
            "Integration & Workflows",
        ],
    },
    {
        img: "/thumbnail1.jpg",
        title: "How to Effectively Use AI in Email",
        desc: "Course Duration: 1 to 2 weeks",
        price: "$29.99",
        modules: [
            "Introduction to AI in Email",
            "Drafting Emails with AI",
            "Editing & Polishing Emails",
            "Personalization & Context",
            "Effective Workflows",
            "Responsible Use of AI",
            "Mini Project",
        ],
    },
];


export const NewCourseDesign2 = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // GSAP Animations remain the same for titles
            gsap.set(".span-para", {
                clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
            });

            gsap.to(".span-para", {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 1.5,
                ease: "power3.inOut",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 50%",
                },
            });

            const split = new SplitText(".title", { type: "words" });
            gsap.from(split.words, {
                opacity: 0,
                y: 40,
                stagger: 0.15,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 90%",
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);




    return (
        <section
            ref={sectionRef} id="course-section"
            // Increased padding/margin for better spacing
            className="relative overflow-hidden  rounded-3xl py-20 px-4 lg:px-16"
        >
            {/* Light gradient background - adjusted opacity and color for softness */}
            <div className="absolute inset-0  pointer-events-none" />

            <div className="relative max-w-screen-xl mx-auto">
                {/* TOP HEADER SECTION: Increased font size for better impact */}
                <div className="text-center mx-auto mb-20 max-w-3xl relative z-10">
                    <h2 className="title text-[2rem] sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-gray-900">
                        Unlock essential
                        <br />
                        <span
                            className="span-para inline-block 
                            bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 
                            text-white px-6 py-3 rounded-2xl font-black shadow-2xl 
                            transition-transform duration-300"
                        >
                            career and life skills
                        </span>
                    </h2>
                    <p className="paragraph text-gray-600 text-lg sm:text-xl leading-relaxed mt-4">
                        Build **high-demand skills** fast with hands-on projects and advance your career
                        in the rapidly evolving job market.
                    </p>
                </div>

                {/* COURSE CARDS SECTION: Responsive grid with more gap */}
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-10 gap-10 relative z-10"
                >
                    {courses.map((course, index) => (
                        <FlipCard key={index} course={course} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// ---
// ## Components
// ---

// ✅ FlipCard component (Refined sizing and visual interaction)
const FlipCard = ({ course }: { course: any }) => {
    const [flipped, setFlipped] = React.useState(false);

    return (
        <div
            // Sizing adjusted to fill grid cell, fixed aspect ratio for visual consistency
            className="relative w-full aspect-square md:aspect-[3/4] h-[480px] perspective cursor-pointer flex-shrink-0 
            transition-all duration-500 hover:scale-[1.05] hover:shadow-2xl"
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
        >
            <div
                className={`relative w-full h-full duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                    }`}
            >
                {/* FRONT */}
                <FlipFront course={course} />

                {/* BACK */}
                <FlipBack course={course} />
            </div>
        </div>
    );
};


// ✅ FlipBack component (Improved Typography and Module List UI)
const FlipBack = ({ course }) => {
    return (
        <div className="absolute inset-0 rotate-y-180 backface-hidden bg-white text-gray-900 rounded-3xl shadow-xl p-8 flex flex-col justify-between border border-indigo-100">
            {/* HEADER */}
            <div className="mb-4">
                <h3 className="text-2xl font-bold text-indigo-800 mb-2">
                    {course.title}
                </h3>
                <p className="text-base text-gray-500 font-medium leading-relaxed">
                    {course.desc}
                </p>
            </div>

            {/* SCROLLABLE LEARNING LIST */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent pr-2">
                <h4 className="text-lg font-bold text-gray-700 mb-4 border-b border-indigo-100 pb-2">
                    What You’ll Learn
                </h4>

                <ul className="space-y-3">
                    {course?.modules?.map((mod, i) => (
                        <li
                            key={i}
                            className="group flex items-start gap-3 text-sm text-gray-700 
                            bg-gradient-to-r from-indigo-50 to-blue-50 
                            p-3 rounded-xl border border-indigo-100 
                            shadow-sm hover:shadow-md 
                            hover:translate-x-1 transition-all duration-300"
                        >
                            <div className="flex-shrink-0 mt-0.5 rounded-full bg-indigo-100 p-1.5 group-hover:bg-indigo-600 transition-colors">
                                <Check className="w-3.5 h-3.5 text-indigo-600 group-hover:text-white" />
                            </div>
                            <span className="leading-snug font-medium">{mod}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* BUTTON */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => handleScrollTo("subscription-section")}
                    className="w-full py-3 text-lg font-bold text-white rounded-xl 
                    bg-gradient-to-r from-indigo-600 via-[#375DB9] to-[#7ED6F4] 
                    shadow-[0_8px_20px_rgba(99,102,241,0.5)] transition-all duration-300 
                    hover:scale-[1.03] hover:shadow-[0_12px_25px_rgba(0,163,255,0.6)]"
                >
                    Enroll Now for {course.price}
                </button>
            </div>
        </div>
    );
};


// ✅ FlipFront component (Improved Overlay and Typography)
const FlipFront = ({ course }) => {
    return (
        <div className=" absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl flex flex-col bg-white border border-gray-100">
            <div
                className="flex-1 bg-cover bg-center p-6 flex flex-col justify-end"
                style={{
                    // Removed Image component usage here for direct background image styling
                    backgroundImage: `url(${course.img})`,
                    // Added subtle overlay for better text contrast
                    position: 'relative',
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black opacity-5"></div>

                <div className="relative bg-white/95 py-6 px-5 rounded-2xl shadow-xl backdrop-blur-sm">
                    {/* Learner count */}
                    <div className="flex items-center gap-3 text-gray-600 text-base mb-3 font-semibold">
                        <span className="text-lg">🎓</span>
                        <span>{course.students || "1.7M+ Learners"}</span>
                    </div>

                    {/* Title + Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                            {course.title}
                        </h3>

                        <span className="inline-block text-lg sm:text-xl font-extrabold text-white px-4 py-1.5 rounded-full bg-gradient-to-r from-[#375DB9] to-[#7ED6F4] shadow-md">
                            {course.price}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    )
}