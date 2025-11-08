"use client";

import React from "react";
import { CourseBuilderForm } from "@/components/course/CourseBuilderForm";
import { useAuth } from "@/hooks/use-auth";
import { coursesApi } from "@/lib/api";
import type { Course } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function NewCoursePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [createdCourse, setCreatedCourse] = React.useState<Course | null>(null);

  if (!currentUser) {
    return null;
  }

  const handleCreateCourse = async (formData: FormData) => {
    try {
      const response = await coursesApi.createDraft(formData);
      
      if (response.course) {
        // Debug: Log the saved course data to see what fields are present
        console.log('🔍 Saved course data:', response.course);
        console.log('🔍 Course fields:', {
          title: response.course.title,
          description: response.course.description,
          price: response.course.price,
          requirements: response.course.requirements,
          whatYouWillLearn: response.course.whatYouWillLearn
        });
        
        // Stay on the same page after successful creation
        // Update the URL to reflect that we're now editing an existing course
        window.history.replaceState(null, '', `/instructor/courses/${response.course._id}/edit`);
        
        // Update component state to show we're now editing the created course
        setCreatedCourse(response.course);
        
        return response.course;
      }
    } catch (error: any) {
      console.error('Failed to create course:', error);
      throw error;
    }
  };

  // If course was created, show the edit form with the course data
  if (createdCourse) {
    const handleUpdateCourse = async (formData: FormData) => {
      try {
        const response = await coursesApi.update(createdCourse._id, formData);
        const updatedCourse = response.course || response;
        
        // Debug: Log the updated course data
        console.log('🔍 Updated course data:', updatedCourse);
        console.log('🔍 Updated course publish status:', {
          isPublished: updatedCourse.isPublished,
          status: updatedCourse.status,
          title: updatedCourse.title
        });
        
        setCreatedCourse(updatedCourse);
        return response;
      } catch (error) {
        console.error('Failed to update course:', error);
        throw error;
      }
    };

    return (
      <CourseBuilderForm course={createdCourse} onSave={handleUpdateCourse} />
    );
  }

  // Show new course form
  return (
    <CourseBuilderForm onSave={handleCreateCourse} />
  );
}
