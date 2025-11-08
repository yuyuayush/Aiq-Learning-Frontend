

"use client";

import { useAuth } from "@/hooks/use-auth";
import { coursesApi } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import { Book, Clock, Users, PlusCircle, Star, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface DashboardStats {
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  overallRating: number;
  recentActivity: any[];
}

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

export default function InstructorDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch dashboard stats and courses in parallel
        const [statsResponse, coursesResponse] = await Promise.all([
          coursesApi.getDashboardStats(),
          coursesApi.getMyCourses({ limit: '3' })
        ]);

        setStats({
          publishedCourses: statsResponse.publishedCourses || 0,
          draftCourses: statsResponse.draftCourses || 0,
          totalStudents: statsResponse.totalStudents || 0,
          overallRating: statsResponse.overallRating || 0,
          recentActivity: statsResponse.recentActivity || []
        });

        setCourses(coursesResponse.courses || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Welcome, {currentUser.name}!</h1>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Published Courses" value={stats?.publishedCourses || 0} icon={<Book />} />
        <StatCard title="Draft Courses" value={stats?.draftCourses || 0} icon={<Clock />} />
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={<Users />} />
        <StatCard title="Overall Rating" value={stats?.overallRating?.toFixed(1) || '0.0'} icon={<Star />} description="from all courses" />
      </div>

       <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="traffic">Traffic</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                        <CardTitle>Performance</CardTitle>
                        <CardDescription>Placeholder for performance charts and data.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                            Chart will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="students">
                    <Card>
                        <CardHeader>
                        <CardTitle>Student Analytics</CardTitle>
                        <CardDescription>Demographics and interests of your students.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                            Student data will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="reviews">
                    <Card>
                        <CardHeader>
                        <CardTitle>Reviews</CardTitle>
                        <CardDescription>Manage and respond to student reviews.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                            Reviews will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="engagement">
                    <Card>
                        <CardHeader>
                        <CardTitle>Engagement Insights</CardTitle>
                        <CardDescription>Analyze how students are interacting with your content.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                           Engagement data and AI insights will be here.
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="traffic">
                    <Card>
                        <CardHeader>
                        <CardTitle>Traffic & Conversion</CardTitle>
                        <CardDescription>See how learners find your courses.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                            Traffic data will be displayed here.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {stats?.recentActivity?.map((activity: any, index: number) => (
                        <li key={index} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-none">
                                    {activity.type === 'enrollment' ? 'New Enrollment' : `New Review`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold">{activity.userName}</span> {activity.type === 'enrollment' ? 'enrolled in' : 'reviewed'} <span className="text-primary">{activity.courseTitle}</span>.
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
                {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                     <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                )}
            </CardContent>
        </Card>
       </div>
               <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold font-headline">Your Courses</h2>
            {courses.length > 3 && (
                <Button variant="outline" asChild>
                    <Link href="/instructor/courses">Show more</Link>
                </Button>
            )}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course: Course) => (
                <Card key={course._id}>
                    <CardHeader className="p-0">
                        <div className="relative h-40 w-full bg-gray-200 rounded-t-lg">
                            {course.thumbnail?.url ? (
                                <Image 
                                    src={`http://localhost:5000${course.thumbnail.url}`} 
                                    alt={course.title} 
                                    fill 
                                    className="object-cover rounded-t-lg" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    No image
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                        <h3 className="font-bold font-headline truncate">{course.title}</h3>
                        <div className="flex justify-between items-center">
                            {course.status === 'published' ? (
                                <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Published</span>
                            ) : (
                                <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Draft</span>
                            )}
                            <p className="text-lg font-bold">${course.price}</p>
                        </div>
                         <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/instructor/courses/${course._id}/edit`}>Edit</Link>
                            </Button>
                             <Button variant="ghost" size="sm">Delete</Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}

    