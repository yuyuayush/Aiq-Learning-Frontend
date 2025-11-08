import Courses from "@/components/Courses";
import CreativeIdea from "@/components/CreativeIdea";
import CtaHome from "@/components/CtaHome";
import Hero from "@/components/Hero";
import Hero2 from "@/components/Hero2";
import CourseSection from "@/components/NewCourseDesign";
import NewCoursesSection from "@/components/NewCoursesSection";
import OurCourses from "@/components/OurCourses";
import QuickTrust from "@/components/QuickTrust";
import { Subscription } from "@/components/Subscription";
import React from "react";

const Home = () => {
  return (
    <main className="bg-[#b88feb]">
      <Hero2 />
      {/* <Hero /> */}
      <QuickTrust />
      <div className="bg-white">

        <CourseSection />

        <CreativeIdea />
      </div>
      {/* <Courses /> */}
      <Subscription />

      {/* <OurCourses />s */}
      {/* <CtaHome /> */}
    </main>
  );
};

export default Home;
