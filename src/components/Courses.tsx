"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const courses = [
  {
    img: "/thumbnail2.jpg",
    title: "Introduction to AI",
    desc: "Course Duration: 1 to 2 weeks\nFormat: Lectures + Hands-on Labs + Mini Projects",
    modules: [
      "Module 1: Foundations of AI",
      "Module 2: Basics of Machine Learning & Data",
      "Module 3: Generative AI & Large Language Models (LLMs)",
      "Module 4: Prompt Engineering (Effective AI Communication)",
      "Module 5: AI Workflows & Tools",
      "Module 6: Responsible AI & Future of Work",
      "Mini Project",
    ],
  },
  {
    img: "/thumbnail3.jpg",
    title: "Microsoft Copilot 365",
    desc: "Course Duration: 2 to 4 weeks (can be adjusted for workshops)\nFormat: Lectures + Live Demos + Hands-on Labs + Mini Projects",
    modules: [
      "Module 1: Introduction to Microsoft Copilot 365",
      "Module 2: Effective Prompting in Copilot",
      "Module 3: Copilot in Microsoft Word",
      "Module 4: Copilot in Excel",
      "Module 5: Copilot in PowerPoint",
      "Module 6: Copilot in Outlook & Teams",
      "Module 7: Copilot Integration & Workflows",
    ],
  },
  {
    img: "/thumbnail1.jpg",
    title: "How to Effectively Use AI in Email",
    desc: "Course Duration: 1 to 2 weeks (or 1-day workshop)\nFormat: Demos + Hands-on Labs + Practice Prompts",
    modules: [
      "Module 1: Introduction to AI in Email",
      "Module 2: Drafting Emails with AI",
      "Module 3: Editing & Polishing Emails",
      "Module 4: Personalization & Context",
      "Module 5: Effective Workflows with AI",
      "Module 6: Responsible Use of AI in Email",
      "Mini Project",
    ],
  },
];

const Courses = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // Track current index for mobile
  const currentIndex = useRef(0);
  // State for expandable modules on mobile
  const [expandedModules, setExpandedModules] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 640) return; // Only run on mobile
    const interval = setInterval(() => {
      const prev = currentIndex.current;
      currentIndex.current = (prev + 1) % courses.length;
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        if (idx === currentIndex.current) {
          gsap.to(card, {
            x: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
          });
        } else {
          gsap.to(card, {
            x: idx < currentIndex.current ? "-100vw" : "100vw",
            autoAlpha: 0,
            scale: 0.95,
            duration: 0.7,
            ease: "power2.in",
          });
        }
      });
    }, 2500);
    // Initial state
    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      if (idx === 0) {
        gsap.set(card, { x: 0, autoAlpha: 1, scale: 1 });
      } else {
        gsap.set(card, { x: "100vw", autoAlpha: 0, scale: 0.95 });
      }
    });
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="w-full pt-10 md:pt-20 pb-32 md:pb-40 bg-white relative"
      id="courses"
    >
      {/* Top-left absolute image overflowing into previous section */}
      <div className="absolute -top-32 md:-top-30 left-4 md:left-20 z-50 pointer-events-none w-[200px] h-[200px] md:w-[400px] md:h-[400px]">
        <Image
          src="/landingpage/coursesTop.png"
          alt="Overflow Graphic"
          fill
          className="object-contain"
          priority
        />
      </div>
      {/* Background Pattern */}
      {/* <Image
        src="/Pattern.png"
        alt="Pattern Background"
        fill
        className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0"
        priority
      /> */}
      <div className="max-w-[1800px]  mx-auto px-8 relative z-10">
        <h2 className="text-5xl md:text-7xl font-extrabold text-black font-hendrix-bold text-center mb-20">
          Our Courses
        </h2>
        {/* Mobile: Carousel */}
        <div className="relative w-full h-[750px] sm:hidden" ref={carouselRef}>
          {courses.map((course, idx) => (
            <Link
              href="/register"
              key={idx}
              className="absolute top-0 left-0 w-full h-full"
              style={{ zIndex: courses.length - idx }}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
            >
              <div
                className="rounded-3xl shadow-2xl border border-blue-200/50 flex flex-col transition-all overflow-hidden backdrop-blur-sm w-full h-full"
                style={{ background: "#B98CF1" }}
              >
                {/* Course Image */}
                <div className="relative w-full mb-4 overflow-hidden rounded-t-3xl bg-white shadow-sm">
                  <Image
                    src={course.img}
                    alt={course.title}
                    width={400}
                    height={220}
                    className="w-full h-[220px] object-contain bg-white p-4"
                    priority
                  />
                </div>
                <div className="px-6 pb-4 flex-1 flex flex-col overflow-hidden">
                  {/* Course Title */}
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 leading-tight">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  {course.desc && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                        Course Overview
                      </h4>
                      <div className="bg-white/80 rounded-lg p-3 shadow-sm border border-blue-100">
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {course.desc}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Modules */}
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                      What You'll Learn
                    </h4>
                    <div className="space-y-2">
                      {(expandedModules[idx]
                        ? course.modules
                        : course.modules.slice(0, 3)
                      ).map((module, moduleIdx) => (
                        <div
                          key={moduleIdx}
                          className="flex items-start space-x-2"
                        >
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {module}
                          </span>
                        </div>
                      ))}

                      {/* Show More/Less Button */}
                      {course.modules.length > 3 && (
                        <button
                          onClick={() =>
                            setExpandedModules((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="flex items-center space-x-2 text-blue-600 font-semibold text-sm mt-3 pl-7 hover:text-blue-800 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              expandedModules[idx] ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                          <span>
                            {expandedModules[idx]
                              ? "Show Less"
                              : `Show ${
                                  course.modules.length - 3
                                } More Modules`}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Course Features */}
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Lifetime Access</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Certificate</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z"
                          />
                        </svg>
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Desktop: Grid */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {courses.map((course, idx) => (
            <Link
              href="/register"
              key={idx}
              className="group min-h-[800px] relative overflow-hidden"
            >
              <div
                className="rounded-3xl shadow-2xl border border-blue-200/50 flex flex-col transition-all duration-500 ease-out hover:-translate-y-3 hover:scale-[1.02] hover:shadow-3xl backdrop-blur-sm min-h-[800px]"
                style={{ background: "#B98CF1" }}
              >
                {/* Course Image */}
                <div className="relative w-full mb-6 overflow-hidden rounded-t-3xl">
                  <Image
                    src={course.img}
                    alt={course.title}
                    width={500}
                    height={280}
                    className="w-full h-[280px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="px-6 lg:px-8 pb-8 flex-1 flex flex-col">
                  {/* Course Title */}
                  <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 leading-tight">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  {course.desc && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Course Overview
                      </h4>
                      <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-blue-100 group-hover:bg-white/90 transition-colors">
                        <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                          {course.desc}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Modules */}
                  <div className="flex-1 overflow-y-auto hide-scrollbar">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      What You'll Learn
                    </h4>
                    <div className="space-y-3">
                      {course.modules.map((module, moduleIdx) => (
                        <div
                          key={moduleIdx}
                          className="flex items-start space-x-3 group/item"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mt-0.5 flex-shrink-0 group-hover/item:scale-110 transition-transform">
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-base text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors">
                            {module}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Features */}
                  {/* <div className="mt-8">
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Lifetime Access</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Certificate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-2-2V10a2 2 0 012-2h8z"
                          />
                        </svg>
                        <span>24/7 Support</span>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;
