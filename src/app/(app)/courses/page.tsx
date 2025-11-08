'use client';

import { useState, useEffect } from 'react';
import { CourseCard } from "@/components/course/CourseCard";
import { coursesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
        const response = await coursesApi.getPublished();
        
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
        
        <div className="container py-8 px-4 md:px-6">
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Available Courses</h1>
            <p className="text-lg text-muted-foreground">
              Find your next learning adventure from our extensive library of courses.
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
      </>
    );
  }

  if (error) {
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
        
        <div className="container py-8 px-4 md:px-6">
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Available Courses</h1>
            <p className="text-lg text-muted-foreground">
              Find your next learning adventure from our extensive library of courses.
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
      </>
    );
  }

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
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Available Courses</h1>
          <p className="text-lg text-muted-foreground">
            Find your next learning adventure from our extensive library of courses.
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard 
                key={course._id} 
                course={{
                  _id: course._id,
                  id: course._id,
                  title: course.title,
                  description: course.description,
                  category: course.category,
                  instructor: course.instructor,
                  instructorId: course.instructor._id,
                  price: course.price,
                  thumbnail: course.thumbnail,
                  banner: course.banner,
                  thumbnailId: course._id,
                  level: 'intermediate',
                  status: 'published' as const,
                  isPublished: true,
                  sections: [],
                  totalDuration: course.totalDuration,
                  enrollmentCount: course.enrolledStudents,
                  averageRating: course.ratings?.average || 0,
                  ratings: course.ratings,
                  enrolledStudents: course.enrolledStudents,
                  totalLectures: course.totalLectures,
                  createdAt: course.createdAt
                } as unknown as Course & { instructor: any; ratings?: { average: number; count: number }; enrolledStudents?: number; totalLectures?: number; }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No courses available at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
