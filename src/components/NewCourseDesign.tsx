"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText);
}

const courses = [
    {
        img: "/placeholder1.png",
        title: "Introduction to AI",
        desc: "Course Duration: 1 to 2 weeks\nFormat: Lectures + Hands-on Labs + Mini Projects",
        price: "$149",
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
        img: "placeholder2.png",
        title: "Microsoft Copilot 365",
        desc: "Course Duration: 2 to 4 weeks\nFormat: Lectures + Demos + Hands-on Labs + Mini Projects",
        price: "$199",
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
        img: "placeholder3.png",
        title: "How to Effectively Use AI in Email",
        desc: "Course Duration: 1 to 2 weeks\nFormat: Demos + Hands-on Labs + Practice Prompts",
        price: "$129",
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


const CourseSection = () => {
    const sectionRef = useRef(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null); // ✅ ref to scroll container

    const handleMove = (direction: string) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollAmount = 400; // you can tweak this
        const newScroll =
            direction === "left"
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;

        gsap.to(container, {
            scrollTo: { x: newScroll, autoKill: true },
            duration: 1.4,
            ease: "elastic.out(1, 0.8)",
        });


    };


    useEffect(() => {
        const ctx = gsap.context(() => {
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
            ref={sectionRef}
            className="relative overflow-hidden bg-white rounded-3xl  py-16 px-6 lg:px-20"
        >
            {/* Light gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-white to-pink-50 opacity-60 pointer-events-none" />

            <div className="relative grid lg:grid-cols-[30%_1fr] xl:grid-cols-[40%_1fr] gap-10 items-start max-w-screen mx-auto">
                {/* LEFT SIDE */}
                <div className="text-center lg:text-left my-auto relative z-10">
                    <h2 className="title text-[1rem] sm:text-[1.3rem] md:text-[1.7rem] lg:text-[3rem] font-bold mb-4 leading-tight text-gray-900">
                        Learn essential
                        <br />
                        <span
                            className="span-para inline-block 
               bg-gradient-to-r from-indigo-500/80 via-indigo-500/80 to-purple-500/80 
               text-white px-4 py-2 rounded-xl font-semibold shadow-xl 
               hover:scale-105 transition-transform duration-300"
                        >
                            career and life skills
                        </span>
                    </h2>
                    <p className="paragraph text-gray-600 text-base leading-relaxed xl:text-lg mt-4">
                        Build in-demand skills fast and advance your career <br />
                        in a changing job market.
                    </p>
                </div>

                {/* RIGHT SIDE (scrollable cards) */}
                <div
                    ref={scrollContainerRef}
                    className="hide-scrollbar flex gap-6 overflow-x-auto pb-4 snap-x relative z-10"
                >
                    {courses.map((course, index) => (
                        <FlipCard key={index} course={course} />
                    ))}
                </div>

                <ScrollButton handleMove={handleMove} />
            </div>
        </section>
    );
};

// ✅ FlipCard component (unchanged)
const FlipCard = ({ course }: { course: any }) => {
    const [flipped, setFlipped] = React.useState(false);

    return (
        <div
            className="relative w-72 sm:w-96 h-[400px] md:h-[360px] lg:h-[400px] xl:h-[500px] xl:w-[400px] perspective cursor-pointer flex-shrink-0 snap-start hover:scale-105 transition-transform duration-300"
            onMouseEnter={() => setFlipped(true)}
            onMouseLeave={() => setFlipped(false)}
        >
            <div
                className={`relative w-full h-full duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                    }`}
            >
                {/* FRONT */}
                <div className=" absolute inset-0 backface-hidden rounded-2xl overflow-hidden shadow-2xl flex flex-col bg-white border border-gray-100">
                    <div
                        className="flex-1 bg-cover bg-center p-4 flex flex-col justify-end"
                        style={{
                            backgroundImage: `url(${course.img})`,
                        }}
                    >
                        <div className="bg-white bg-opacity-95 py-6 px-4 rounded-xl shadow-md">
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                                <span className="text-base">👥</span>
                                <span>{course.students || "1.7M+"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {course.title}
                                </h3>
                                <span className="text-black text-2xl font-extrabold">→</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 rotate-y-180 backface-hidden bg-white text-gray-900 rounded-2xl shadow-xl p-6 flex flex-col justify-between border border-gray-200">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-indigo-700 mb-2">
                            {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 whitespace-pre-line">
                            {course.desc}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            Course Modules:
                        </h4>
                        <ul className="space-y-2">
                            {course.modules.map((mod: string, i: number) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 bg-gray-50 p-2 rounded-md border border-gray-100 hover:bg-indigo-50 transition"
                                >
                                    <span className="text-indigo-500 mt-1">•</span>
                                    <span className="text-sm leading-snug">{mod}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 text-center">
                        <button className="w-full py-2.5 text-lg font-semibold text-white rounded-xl bg-gradient-to-r from-[#A371F7] via-[#00A3FF] to-[#A371F7] shadow-[0_0_15px_rgba(163,113,247,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,163,255,0.6)]">
                            {course.price}
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

// ✅ Copilot-themed scroll buttons
const ScrollButton = ({ handleMove }) => {
    return (
        <div
            className="
        absolute 
        flex gap-3 sm:gap-4
        -bottom-10 sm:-bottom-12 md:-bottom-14 
        sm:right-[25%] 
        md:right-[15%] lg:right-[20%] xl:right-[25%]
        z-20
      "
        >
            {/* LEFT BUTTON */}
            <button
                onClick={() => handleMove("left")}
                className="
          px-3 py-2 sm:px-4 md:px-5 sm:py-2 rounded-lg sm:rounded-xl
          text-white font-medium text-base sm:text-lg
          bg-gradient-to-r from-[#49A3E2] via-[#B599D5] to-[#C6A6EB]
          shadow-[0_0_10px_rgba(182,153,222,0.5)]
          hover:shadow-[0_0_18px_rgba(182,153,222,0.9)]
          hover:scale-105 active:scale-95
          transition-all duration-300
        "
            >
                ←
            </button>

            {/* RIGHT BUTTON */}
            <button
                onClick={() => handleMove("right")}
                className="
          px-3 py-2 sm:px-4 md:px-5 sm:py-2 rounded-lg sm:rounded-xl
          text-white font-medium text-base sm:text-lg
          bg-gradient-to-r from-[#C6A6EB] via-[#B599D5] to-[#49A3E2]
          shadow-[0_0_10px_rgba(182,153,222,0.5)]
          hover:shadow-[0_0_18px_rgba(182,153,222,0.9)]
          hover:scale-105 active:scale-95
          transition-all duration-300
        "
            >
                →
            </button>
        </div>
    );
};


export default CourseSection;
