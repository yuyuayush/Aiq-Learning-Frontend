import Courses from "@/components/Courses";
import CreativeIdea from "@/components/CreativeIdea";
import CreativeIdea2 from "@/components/CreativeIdea2";
import CtaHome from "@/components/CtaHome";
import Hero from "@/components/Hero";
import Hero2 from "@/components/Hero2";
import CourseSection from "@/components/NewCourseDesign";
import { NewCourseDesign2 } from "@/components/NewCourseDesign2";
import NewCoursesSection from "@/components/NewCoursesSection";
import OurCourses from "@/components/OurCourses";
import QuickTrust from "@/components/QuickTrust";
import { Subscription } from "@/components/Subscription";
import React from "react";

const Home = () => {
  return (
    <main className="bg-gradient-to-br from-[#9186f7] via-[#dce0f8] to-[#f8c7f0dc]">
      <Hero2 />
      {/* <Hero /> */}
      <QuickTrust />
      <NewCourseDesign2 />

      <CreativeIdea />
      <Subscription />
      <div className="bg-gradient-to-br from-[#9186f7] via-[#dce0f8] to-[#f8c7f0dc]">

        {/* <CourseSection /> */}
      </div>
      {/* <CreativeIdea2 /> */}
      {/* <Courses /> */}

      {/* <OurCourses /> */}
      {/* <CtaHome /> */}
    </main>
  );
};

export default Home;
