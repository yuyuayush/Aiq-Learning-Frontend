"use client";

import { useAuth } from "@/hooks/use-auth";
import { coursesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { PlusCircle, Loader2, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: { url: string };
  status: 'draft' | 'published';
  price: number;
  createdAt: string;
  updatedAt: string;
  enrolledStudents: number;
  totalLectures: number;
  totalDuration: number;
  ratings?: { average: number };
}

export default function InstructorCoursesPage() {
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (filter !== 'all') {
          params.status = filter;
        }
        const response = await coursesApi.getMyCourses(params);
        setCourses(response.courses || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentUser, filter]);

    const handleDeleteCourse = async (courseId: string) => {
    try {
      // Show confirmation dialog
      if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        return;
      }

      setDeletingCourseId(courseId);

      // Call the backend API to delete the course
      await coursesApi.deleteCourse(courseId);
      
      // Remove from local state only after successful deletion
      setCourses(prev => prev.filter(course => course._id !== courseId));
      
      toast({
        title: "Course Deleted",
        description: "The course has been permanently deleted from the database.",
      });
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingCourseId(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-headline">My Courses</h1>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { key: 'all', label: 'All Courses' },
          { key: 'published', label: 'Published' },
          { key: 'draft', label: 'Drafts' }
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'ghost'}
            onClick={() => setFilter(tab.key as typeof filter)}
            size="sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course: Course) => (
            <Card key={course._id}>
              <CardHeader className="p-0">
                <div className="relative h-40 w-full bg-gray-200 rounded-t-lg">
                  {course.thumbnail?.url ? (
                    <img
                      src={`http://localhost:5000${course.thumbnail.url}`}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
              </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-bold font-headline h-12 leading-tight overflow-hidden">{course.title}</h3>
                  <div className="flex justify-between items-center">
                    {course.status === 'published' ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                        Draft
                      </span>
                    )}
                    <p className="text-lg font-bold">${course.price}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/instructor/courses/${course._id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCourse(course._id)}
                      disabled={deletingCourseId === course._id}
                    >
                      {deletingCourseId === course._id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      {deletingCourseId === course._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">You haven't created any courses yet.</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            Get started by creating your first course.
          </p>
          <Button asChild>
            <Link href="/instructor/courses/new">Create New Course</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
