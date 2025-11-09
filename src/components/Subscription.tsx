"use client";
import React from "react";
import Image from "next/image";

const courses = [
  {
    img: "/thumbnail2.png",
    title: "Introduction to AI",
    desc: "Course Duration: 1 to 2 weeks\nFormat: Lectures + Hands-on Labs + Mini Projects",
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
    desc: "Course Duration: 2 to 4 weeks\nFormat: Lectures + Demos + Hands-on Labs + Mini Projects",
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
    desc: "Course Duration: 1 to 2 weeks\nFormat: Demos + Hands-on Labs + Practice Prompts",
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

export const Subscription = () => {
  const mainGradient = "from-[#4F46E5] via-[#A855F7] to-[#EC4899]";

  return (
    <section id="subscription-section" className="relative text-gray-800 py-20 px-6 md:px-10 xl:px-20 overflow-hidden">
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#F0F4FF] to-[#FFFFFF]"></div> */}
      <div className="absolute -top-32 -left-20 w-[350px] h-[350px]  rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#A855F7]/20 rounded-full blur-3xl opacity-50 animate-pulse delay-700"></div>

      <div className="max-w-6xl mx-auto text-center mb-14 relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#4F46E5] to-[#EC4899] bg-clip-text text-transparent">
          🚀 Learn AI the Copilot Way
        </h2>
        <p className="text-gray-600 text-base md:text-lg mt-3 max-w-2xl mx-auto">
          Boost your productivity with <strong>hands-on AI and Copilot learning paths</strong> — built for creators, developers, and teams.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {courses.map((course, index) => (
          <div
            key={index}
            className="group relative border border-gray-200 bg-white/90 backdrop-blur-sm rounded-2xl p-8 transition-all duration-300 shadow-xl hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#4F46E5]/30"
          >
            <div className="flex flex-col items-center pb-4">
              {/* <Image
                src={course.img}
                alt={course.title}
                // Set fixed high dimensions required by Next.js, but let Tailwind control the display size
                width={100}
                height={100}
                className="
        rounded-full shadow-lg mb-4 object-cover border-4 border-white 
        w-20 h-20 
        group-hover:border-[#8B5CF6] transition-colors
    "
              /> */}
              <h3 className="text-2xl font-bold mb-1 text-[#1F2937]">{course.title}</h3>
              <p className="text-gray-500 whitespace-pre-line text-center text-sm mb-3">{course.desc}</p>
              <p
                className={`text-4xl font-extrabold bg-gradient-to-r ${mainGradient} bg-clip-text text-transparent mb-4`}
              >
                {course.price}
              </p>
            </div>

            <div className="text-left border-t border-gray-200 pt-5 space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">What you'll learn:</p>
              {course.modules.map((mod, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 bg-[#6366F1] rounded-full flex-shrink-0"></span>
                  <p className="text-sm text-gray-700">{mod}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                className={`px-8 py-3 bg-gradient-to-r ${mainGradient} text-white font-semibold text-lg rounded-lg transition-all shadow-md hover:shadow-lg hover:shadow-[#4F46E5]/50 active:scale-95`}
              >
                Enroll Now
              </button>
            </div>

            <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#A855F7]/10 to-[#4F46E5]/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500"></div>
          </div>
        ))}
      </div>

      {/* Combo Offer Card */}
      <div className="mt-12 max-w-4xl mx-auto relative z-10">
        <div className="relative border-2 border-[#8B5CF6] bg-white shadow-2xl rounded-3xl p-10 flex flex-col items-center text-center transition-transform transform hover:scale-105">
          <div className="absolute -top-6 px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#EC4899] text-white font-bold rounded-full text-sm tracking-wider shadow-lg">
            ⭐ Most Recommended
          </div>
          <h3 className="text-3xl font-extrabold text-[#1F2937] mb-4">AI Mastery Combo</h3>
          <p className="text-gray-600 mb-6">
            Get all 3 courses together at a discounted price. Learn AI, Copilot 365, and Email AI effectively!
          </p>
          <p className={`text-5xl font-extrabold bg-gradient-to-r ${mainGradient} bg-clip-text text-transparent mb-6`}>
            $69.99
          </p>
          <button
            className={`px-12 py-4 bg-gradient-to-r ${mainGradient} text-white font-semibold text-lg rounded-xl transition-all shadow-lg hover:shadow-2xl hover:shadow-[#4F46E5]/50 active:scale-95`}
          >
            Enroll in Combo
          </button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-[#A855F7]/20 to-[#4F46E5]/20 rounded-3xl blur-3xl opacity-70"></div>
        </div>
      </div>
    </section>
  );
};
