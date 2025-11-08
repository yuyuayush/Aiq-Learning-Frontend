"use client";
import React from "react";
import Image from "next/image";

const courses = [
  {
    img: "/mainhero.png",
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
    img: "/mainhero.png",
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
    img: "/mainhero.png",
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

export const Subscription = () => {
  // Define a stronger, more refined gradient palette
  const mainGradient = "from-[#4F46E5] via-[#A855F7] to-[#EC4899]"; // Indigo -> Purple -> Pink

  return (
    <section className="relative bg-white text-gray-800 py-20 px-6 md:px-10 overflow-hidden">
      {/* Updated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F0F4FF] to-[#FFFFFF]"></div>
      
      {/* Floating soft background orbs (Updated colors) */}
      <div className="absolute -top-32 -left-20 w-[350px] h-[350px] bg-[#6366F1]/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#A855F7]/20 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

      <div className="max-w-6xl mx-auto text-center mb-14 relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#4F46E5] to-[#EC4899] bg-clip-text text-transparent">
          🚀 Learn AI the Copilot Way
        </h2>
        <p className="text-gray-600 text-base md:text-lg mt-3 max-w-2xl mx-auto">
          Boost your productivity with **hands-on AI and Copilot learning paths** — built for creators, developers, and teams.
        </p>
      </div>

      {/* Grid structure ensures responsiveness: 1 column on small, 2 on medium, 3 on large */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {courses.map((course, index) => (
          <div
            key={index}
            className="group relative border border-gray-200 bg-white/90 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 shadow-xl 
                       hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#4F46E5]/30" // Stronger hover shadow
          >
            {/* Top Content */}
            <div className="flex flex-col items-center pb-4">
              <Image
                src={course.img}
                alt={course.title}
                width={80}
                height={80}
                className="rounded-full shadow-lg mb-4 object-cover border-4 border-white group-hover:border-[#8B5CF6] transition-colors"
              />
              <h3 className="text-2xl font-bold mb-1 text-[#1F2937]">
                {course.title}
              </h3>
              <p className="text-gray-500 whitespace-pre-line text-center text-sm mb-3">
                {course.desc}
              </p>
              <p className={`text-4xl font-extrabold bg-gradient-to-r ${mainGradient} bg-clip-text text-transparent mb-4`}>
                {course.price}
              </p>
            </div>

            {/* Modules List */}
            <div className="text-left border-t border-gray-200 pt-5 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">What you'll learn:</p>
              {course.modules.map((mod, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3" // Changed to items-start for multi-line text
                >
                  {/* Updated bullet point color */}
                  <span className="mt-1 w-2 h-2 bg-[#6366F1] rounded-full flex-shrink-0"></span>
                  <p className="text-sm text-gray-700"> {/* Darker text for readability */}
                    {mod}
                  </p>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="mt-8 flex justify-center">
              <button 
                className={`px-8 py-3 bg-gradient-to-r ${mainGradient} text-white font-semibold text-lg rounded-lg transition-all shadow-md 
                           hover:shadow-lg hover:shadow-[#4F46E5]/50 active:scale-95`}
              >
                Enroll Now
              </button>
            </div>

            {/* Soft glow hover effect (Updated colors) */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#A855F7]/10 to-[#4F46E5]/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"></div>
          </div>
        ))}
      </div>
    </section>
  );
};