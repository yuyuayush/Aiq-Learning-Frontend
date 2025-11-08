'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CourseCard } from "@/components/course/CourseCard";
import { coursesApi, studentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Book } from "lucide-react";
import type { Course } from "@/lib/types";

interface BackendCourse {
  _id: string;
  title: string;
  description: string;
  thumbnail?: { url: string };
  banner?: { url: string };
  price: number;
  enrolledStudents: number;
  totalLectures: number;
  totalDuration: number;
  ratings?: {
    average: number;
    count: number;
  };
  instructor: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  category: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await studentApi.getMyCourses();
        
        if (response.courses) {
          console.log('Courses received:', response.courses[0]); // Debug first course
          setCourses(response.courses);
        } else {
          setError('No courses data received');
        }
      } catch (err: any) {
        console.error('Failed to fetch courses:', err);
        setError(err.message || 'Failed to fetch courses');
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  if (loading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Enrolled courses</h1>
          <p className="text-lg text-muted-foreground">
            All The courses you are enrolled in.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Enrolled Courses</h1>
          <p className="text-lg text-muted-foreground">
            All The courses you are enrolled in.
          </p>
        </div>

        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Use the fetched courses array as myCourses (enrollment objects or raw course objects)
  const myCourses: any[] = courses as any[];

  return (
    <>
      {/* Fixed background covering entire viewport */}
      <div 
        style={{
          backgroundImage: 'url("/Pattern_backend.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          filter: 'blur(4px)',
          backgroundColor: 'rgba(128, 128, 128, 0.2)', // Grey tint
          backgroundBlendMode: 'overlay'
        }}
        className="fixed inset-0 -z-10"
      />
      
      {/* Content */}
      <div className="container py-8 px-4 md:px-6">
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Enrolled Courses</h1>
          <p className="text-lg text-muted-foreground">
            All The courses you are enrolled in.
          </p>
        </div>

        {myCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.slice(0, 6).map((enrollment: any) => {
              const course = enrollment.course || enrollment;
              
              return (
                <div key={course._id} className="relative">
                  <CourseCard course={course} />
                  
                  {/* Progress overlay for enrolled courses */}
                  <div className="absolute bottom-2 left-2 right-2 bg-white rounded-lg p-2 shadow-sm">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(enrollment.progress?.overallProgress || 0)}%</span>
                    </div>
                    <Progress value={enrollment.progress?.overallProgress || 0} className="w-full mt-1" />
                    <Button className="w-full mt-2" size="sm" asChild>
                      <Link href={`/learner/courses/${course._id}/learn`}>
                        {enrollment.completed ? 'Review' : (enrollment.progress?.overallProgress || 0) > 0 ? 'Continue' : 'Start'}
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You are not enrolled in any courses yet.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
