"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { CourseBuilderForm } from "@/components/course/CourseBuilderForm";
import { coursesApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { Course } from "@/lib/types";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getById(courseId);
        setCourse(response.course); // Extract course from response
      } catch (error) {
        console.error('Failed to fetch course:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleUpdateCourse = async (formData: FormData) => {
    try {
      const response = await coursesApi.update(courseId, formData);
      const updatedCourse = response.course || response;
      
      // Debug: Log the updated course publish status
      console.log('🔍 Course update response:', {
        isPublished: updatedCourse.isPublished,
        status: updatedCourse.status,
        title: updatedCourse.title
      });
      
      setCourse(updatedCourse); // Handle both response formats
      console.log("Course updated", response);
      // Stay on the same page after update
      return response;
    } catch (error) {
      console.error('Failed to update course:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  return (
    <CourseBuilderForm course={course} onSave={handleUpdateCourse} />
  );
}
