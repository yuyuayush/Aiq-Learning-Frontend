"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}
// Course data type
type Course = {
  title: string;
  description: string;
  image: string;
};

// List of courses (expand as needed)
const courses: Course[] = [
  {
    title: "Microsoft Copilot 365",
    description:
      "This course is the perfect starting point for anyone looking to understand and ethically apply the power of AI tools.",
    image: "/placeholder1.png",
  },
  {
    title: "Intoduction to AI",
    description:
      "Master the art of crafting effective prompts for AI models to get the best results.",
    image: "/placeholder2.png",
  },
  {
    title: "Using AI in Email",
    description:
      "Learn about the ethical considerations and safe practices when working with AI.",
    image: "/placeholder3.png",
  },
];

// Main section component
const OurCourses: React.FC = () => {
  // Track which panel is expanded
  const [activeIdx, setActiveIdx] = useState(0);
  // Refs for each panel
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Animate panel widths/heights on activeIdx change
  useEffect(() => {
    if (!detailsRef.current) return;
    // Responsive: use width for desktop, height for mobile
    const isMobile = window.innerWidth < 768;
    courses.forEach((_, idx) => {
      const el = panelRefs.current[idx];
      if (!el) return;
      const expanded = idx === activeIdx;
      if (isMobile) {
        gsap.to(el, {
          height: expanded ? "210px" : "45px",
          width: "100%",
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        gsap.to(el, {
          width: expanded ? "70%" : "15%",
          height: "500px",
          duration: 0.5,
          ease: "power2.out",
        });
      }
    });

    // Animate the description text
    gsap
      .timeline()
      .to(detailsRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.25,
        ease: "power2.in",
      })
      .to(detailsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power2.out",
      });
  }, [activeIdx]);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-animation on resize
      setActiveIdx((idx) => idx);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Entrance animation on scroll
  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const panels = panelRefs.current.filter(Boolean);

    if (!section || !title || panels.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    const splitTitle = new SplitText(title, { type: "chars" });

    tl.from(splitTitle.chars, {
      opacity: 0,
      y: 50,
      stagger: 0.05,
      duration: 0.8,
      ease: "power3.out",
    }).from(
      panels,
      {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
      },
      "-=0.6"
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col items-center justify-center py-12 bg-[#3B5480]"
    >
      {/* Card container with heading inside */}
      <div
        className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-lg px-4 md:px-12 py-8 border-0 flex flex-col"
        style={{ minHeight: 420 }}
      >
        {/* Title inside card */}
        <h2
          ref={titleRef}
          className="text-5xl md:text-7xl font-extrabold mb-6 text-center text-black tracking-tight"
        >
          OUR COURSES
        </h2>
        {/* Panels */}
        <div
          className="flex md:flex-row flex-col gap-4 mb-6 w-full items-stretch transition-all"
          style={{ minHeight: 210 }}
        >
          {courses.map((course, idx) => (
            <div
              key={course.title}
              ref={(el) => {
                panelRefs.current[idx] = el;
              }}
              className={`rounded-xl cursor-pointer flex items-center justify-center overflow-hidden transition-opacity hover:opacity-90 bg-white`}
              style={{
                width: idx === 0 ? "70%" : "15%",
                height: 210,
                transition: "none", // GSAP handles animation
                minWidth: 0,
                minHeight: 0,
              }}
              onClick={() => setActiveIdx(idx)}
              aria-label={`Show details for ${course.title}`}
            >
              <Image
                src={course.image}
                alt={course.title}
                fill={false}
                width={600}
                height={210}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                className="rounded-xl border-2 border-gray-200"
                priority={idx === 0}
              />
              {/* Show title on mobile when collapsed */}
              <span
                className={
                  "absolute text-lg font-semibold text-gray-600 select-none transition-opacity duration-300 z-10 " +
                  (activeIdx === idx ? "opacity-0" : "opacity-100 md:opacity-0")
                }
              >
                {course.title}
              </span>
            </div>
          ))}
        </div>
        {/* Course details */}
        <div ref={detailsRef} className="mt-2 px-2 md:px-0">
          <h3 className="text-2xl md:text-3xl font-bold text-[#23304A] mb-1">
            {courses[activeIdx].title}
          </h3>
          <p className="text-[#23304A] text-sm md:text-base">
            {courses[activeIdx].description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default OurCourses;
