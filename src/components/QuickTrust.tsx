"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { FaStar, FaRegStar } from "react-icons/fa";
import { LuArrowBigUp } from "react-icons/lu";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const QuickTrust = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

const testimonials = [
  {
    id: 1,
    name: "Jack T.",
    role: "Student",
    rating: 5,
    text: "Finding and enrolling in a course on AiQ Learning was incredibly easy. The content is top-notch and the learning environment is great. I highly recommend and will be enrolling in another course soon!",
  },
  {
    id: 2,
    name: "Rita M.",
    role: "Student",
    rating: 5,
    text: "The courses at AiQ Learning are fantastic, applying what I learned in my job. The pace was easy to see and the instructor was brilliant. Great value and would highly recommend for anyone to spark!",
  },
  {
    id: 3,
    name: "Sarah K.",
    role: "Student",
    rating: 5,
    text: "Excellent platform with high-quality content. The instructors are knowledgeable and the course structure is perfect for learning at your own pace.",
  },
  {
    id: 4,
    name: "Mike D.",
    role: "Student",
    rating: 5,
    text: "AiQ Learning has transformed my career. The practical approach and real-world examples make learning engaging and effective.",
  },
  {
    id: 5,
    name: "Priya S.",
    role: "Student",
    rating: 5,
    text: "I loved the interactive lessons and the supportive community. AiQ Learning made it easy to stay motivated and complete my course.",
  },
  {
    id: 6,
    name: "Carlos V.",
    role: "Student",
    rating: 4,
    text: "Great content and instructors! The platform is user-friendly and the resources provided are very helpful for self-study.",
  },
  {
    id: 7,
    name: "Emily W.",
    role: "Student",
    rating: 5,
    text: "The flexibility of AiQ Learning allowed me to balance my studies with work. Highly recommend for busy professionals.",
  },
  {
    id: 8,
    name: "David L.",
    role: "Student",
    rating: 4,
    text: "I gained practical skills that I could apply immediately. The course materials are well-structured and easy to follow.",
  },
  // --- New Testimonials Added Below ---
  {
    id: 9,
    name: "Aisha N.",
    role: "Software Developer",
    rating: 5,
    text: "As a professional, I appreciate the **in-depth, advanced topics**. The AI Ethics course was particularly insightful and directly applicable to my projects.",
  },
  {
    id: 10,
    name: "Ben F.",
    role: "Data Scientist",
    rating: 5,
    text: "Absolutely the best platform for **Machine Learning** courses. The hands-on labs and peer review system elevate the learning experience.",
  },
  {
    id: 11,
    name: "Chen L.",
    role: "Product Manager",
    rating: 4,
    text: "The 'AI for Non-Technical Leaders' course was a game-changer. I wish there was more post-course support, but the content itself was top-tier.",
  },
  {
    id: 12,
    name: "Lena H.",
    role: "Recent Graduate",
    rating: 5,
    text: "I used AiQ Learning to build a portfolio that helped me land my first job. The **career-focused projects** made all the difference!",
  },
  {
    id: 13,
    name: "Omar Z.",
    role: "Entrepreneur",
    rating: 5,
    text: "Efficient and high-impact. I learned how to integrate AI into my startup's operations in weeks, not months. **Excellent ROI.**",
  },
  {
    id: 14,
    name: "Kim A.",
    role: "Marketing Specialist",
    rating: 4,
    text: "The curriculum on **Generative AI** was incredibly current. The only small issue was occasional video buffering, but the quality of teaching overshadowed it.",
  },
  {
    id: 15,
    name: "Rajesh P.",
    role: "Student",
    rating: 5,
    text: "Fantastic support team and highly responsive instructors. It truly feels like a **personalized learning journey**.",
  },
  {
    id: 16,
    name: "Sophie R.",
    role: "IT Consultant",
    rating: 5,
    text: "I've tried other platforms, but AiQ Learning's focus on **practical application and real-world scenarios** is unmatched.",
  },
  {
    id: 17,
    name: "Gary B.",
    role: "Student",
    rating: 3,
    text: "While the instructor was excellent, the prerequisites for the advanced course weren't clear enough. I had to spend extra time catching up.",
  },
  {
    id: 18,
    name: "Nina M.",
    role: "HR Manager",
    rating: 5,
    text: "Completed the 'AI in Business' course. The content was perfect for understanding how to leverage AI without needing to code. **Highly recommended for business users.**",
  },
  {
    id: 19,
    name: "Hugo T.",
    role: "Freelancer",
    rating: 5,
    text: "The **self-paced learning** model is perfect for my unpredictable schedule. I was able to gain a new, marketable skill easily.",
  },
  {
    id: 20,
    name: "Eva G.",
    role: "Data Analyst",
    rating: 4,
    text: "Solid, technical content. The assignments were challenging but rewarding. I would love to see more courses on **advanced deep learning frameworks**.",
  },
];

  // Scroll-triggered animations for the left content
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const heading = section.querySelector(".trust-heading");
    const paragraph = section.querySelector(".trust-paragraph");
    const stats = section.querySelectorAll(".trust-stat");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none none",
      },
    });

    if (heading) {
      const split = new SplitText(heading, { type: "words" });
      tl.fromTo(
        split.words,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }
      );
    }

    tl.fromTo(
      paragraph,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    ).fromTo(
      stats,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "power3.out" },
      "-=0.6"
    );
  }, []);

  useEffect(() => {
    if (marqueeRef.current) {
      const marqueeContainer = marqueeRef.current;
      const containerWidth = marqueeContainer.scrollWidth;

      // Simple continuous scroll animation from right to left
      gsap.fromTo(
        marqueeContainer,
        { x: 0 }, // Start from visible position
        {
          x: `-${containerWidth}px`, // Move to left by full width
          duration: 50, // Medium speed - 25 seconds for full cycle
          ease: "none",
          repeat: -1,
        }
      );
    }
  }, []);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? (
        <FaStar key={i} className="w-4 h-4 text-blue-500 inline-block" />
      ) : (
        <FaRegStar key={i} className="w-4 h-4 text-gray-300 inline-block" />
      )
    );
  };

  return (
    <section ref={sectionRef} className=" text-white py-20 lg:pl-20 md:py-32 relative">
      <div className="w-full px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center md:gap-0">
          {/* Left Content */}
          <div className="w-full md:w-[45%] px-0 md:px-8 flex flex-col justify-center mb-6 md:mb-0">
            <h2 className="trust-heading text-[2rem] sm:text-[2.2rem] md:text-[2.7rem] lg:text-[2.8rem] font-bold mb-2 leading-tight">
              Unlocking Learner Potential
              <br />
              through{" "}
              <span className="bg-[#EBE5FB] text-[#4A69BD] px-2 py-1 rounded-md font-bold tracking-tight align-middle">
                AiQ LEARNING
              </span>
            </h2>
            <p className="trust-paragraph text-base sm:text-lg text-blue-100 mb-4 leading-relaxed font-medium">
              Ready to learn something new? Your next course is waiting for you.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
              <div className="trust-stat flex items-center gap-2">
                {/* Growth graph icon */}
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 17l4-4 4 4 8-8"
                  />
                  <circle cx="4" cy="17" r="1.5" fill="white" />
                  <circle cx="8" cy="13" r="1.5" fill="white" />
                  <circle cx="12" cy="17" r="1.5" fill="white" />
                  <circle cx="20" cy="9" r="1.5" fill="white" />
                </svg>
                <span className="text-xl font-bold align-middle"></span>
              </div>
              <span className="trust-stat hidden sm:inline border-l border-white h-6 mx-2"></span>
              <div className="trust-stat text-white font-semibold text-[0.98rem] leading-tight mt-1 sm:mt-0">
                The achievement rate of participants who have
                <br className="hidden sm:block" />
                completed our comprehensive training program.
              </div>
            </div>
          </div>

          {/* Right Marquee */}
          <div className="w-full md:w-[55%] relative">
            <div className="overflow-hidden h-[240px] sm:h-[260px] md:h-[280px] flex items-center relative">
              {/* Fade overlays */}
              <div className="absolute left-0 top-7  w-16 h-[80%] bg-gradient-to-r from-[#e0def7c4] rounded-tl-sm rounded-bl-sm to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-[#E0DEF7] to-transparent z-10 pointer-events-none"></div>

              <div ref={marqueeRef} className="flex gap-2">
                {/* Original testimonials - no duplication */}
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-[#ECDDFF] border border-black rounded-3xl px-4 sm:px-5 md:px-6 py-4 sm:py-5 w-[280px] sm:w-[320px] md:w-[350px] h-[180px] sm:h-[200px] md:h-[220px] shadow-lg flex-shrink-0 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1 mb-3 sm:mb-4">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm sm:text-base text-gray-800 mb-4 sm:mb-6 leading-relaxed flex-grow line-clamp-3 overflow-hidden">
                      {testimonial.text}
                    </p>
                    <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                      {/* <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-300 rounded-full border-2 border-gray-200 flex-shrink-0"></div> */}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {testimonial.name}
                        </p>
                        {/* <p className="text-xs text-gray-500">
                          {testimonial.role}
                        </p> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickTrust;
