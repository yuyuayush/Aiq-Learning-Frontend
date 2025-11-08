"use client";

import { useAuth } from "@/hooks/use-auth";
import { studentApi } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import { Book, CheckCircle, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CourseCard } from "@/components/course/CourseCard";
import { certificateApi } from "@/lib/api";
import CertificateModal from "@/components/certificates/CertificateModal";
import { isCourseCompleted, calculateCourseProgress } from "@/lib/course-utils";

interface DashboardData {
  enrollments: any[];
  myCourses: any[];
  overview: {
    totalEnrolled: number;
    totalCompleted: number;
    totalCertificates: number;
    totalWatchTime: number;
    overallProgress: number;
  };
  certificates: any[];
}

export default function StudentDashboard() {
  const { currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data when page becomes visible (user comes back from course)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && currentUser) {
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [enrollmentsRes, myCoursesRes, overviewRes, certificatesRes] = await Promise.all([
        studentApi.getMyEnrollments(),
        studentApi.getMyCourses(), 
        studentApi.getDashboardOverview(),
        certificateApi.getCertificates().catch((error) => {
          console.warn('Certificate API unavailable:', error.message);
          return { certificates: [], serviceUnavailable: true };
        })
      ]);

      const certificates = certificatesRes.certificates || [];

      setDashboardData({
        enrollments: enrollmentsRes.enrollments || [],
        myCourses: myCoursesRes.courses || [],
        certificates,
        overview: overviewRes.overview ? {
          ...overviewRes.overview,
          totalCertificates: certificates.length, // Use actual certificate count
        } : {
          totalEnrolled: 0,
          totalCompleted: 0, 
          totalCertificates: certificates.length,
          totalWatchTime: 0,
          overallProgress: 0
        }
      });

    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Welcome back, {currentUser.name}!</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg p-6 h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Welcome back, {currentUser.name}!</h1>
        <div className="text-center py-8">
          <p>No data available. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const { overview, myCourses, certificates } = dashboardData;
  const inProgressCourses = myCourses.filter((course: any) => !course.completed && course.progress > 0);
  const lastCourse = inProgressCourses[0];

  // Helper function to format time from seconds to "XhXm" format
  const formatWatchTime = (seconds: number): string => {
    console.log('🕒 Formatting watch time:', seconds, 'seconds');
    if (seconds === 0) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Function to handle certificate viewing
  const handleViewCertificate = async (courseId: string) => {
    try {
      // First try to get existing certificate
      let response = await certificateApi.getCertificateByCourse(courseId);
      
      // Check if service is unavailable (permissions or not implemented)
      if (response.serviceUnavailable) {
        toast({
          title: "Certificate Service Unavailable", 
          description: "Certificate service is currently unavailable. Please try again later.",
          variant: "destructive"
        });
        return;
      }
      
      // If no certificate exists, generate one (since course is already completed)
      if (!response.certificate && response.success === false) {
        toast({
          title: "Generating Certificate",
          description: "Generating your certificate...",
        });
        
        try {
          const generateResponse = await certificateApi.generateCertificate(courseId);
          console.log('Generate certificate response:', generateResponse);
          if (generateResponse.success && generateResponse.certificate) {
            console.log('Generated certificate:', generateResponse.certificate);
            setSelectedCertificate(generateResponse.certificate);
            setCertificateModalOpen(true);
            toast({
              title: "Certificate Generated",
              description: "Your certificate has been generated successfully!",
            });
            return;
          }
        } catch (generateError) {
          console.error('Error generating certificate:', generateError);
        }
      }
      
      if (response.certificate) {
        console.log('Found existing certificate:', response.certificate);
        setSelectedCertificate(response.certificate);
        setCertificateModalOpen(true);
      } else {
        toast({
          title: "Certificate Not Available",
          description: "Unable to generate certificate at this time.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error fetching certificate:', error);
      
      // Handle different error scenarios
      if (error.status === 404) {
        // If 404, try to generate certificate
        toast({
          title: "Generating Certificate",
          description: "Certificate not found, generating now...",
        });
        
        try {
          const generateResponse = await certificateApi.generateCertificate(courseId);
          if (generateResponse.success && generateResponse.certificate) {
            setSelectedCertificate(generateResponse.certificate);
            setCertificateModalOpen(true);
            toast({
              title: "Certificate Generated",
              description: "Your certificate has been generated successfully!",
            });
            return;
          }
        } catch (generateError) {
          console.error('Error generating certificate:', generateError);
        }
        
        toast({
          title: "Certificate Not Available",
          description: "Unable to generate certificate at this time.",
          variant: "destructive"
        });
      } else if (error.status === 403 || error.message?.includes('Insufficient permissions')) {
        toast({
          title: "Certificate Not Available",
          description: "Unable to access certificate for this course.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error", 
          description: "Certificate service is temporarily unavailable. Please try again later.",
          variant: "destructive"
        });
      }
    }
  };


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
      
      {/* Content with relative positioning */}
      <div className="relative space-y-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light font-headline">Welcome back, {currentUser.name}!</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Enrolled Courses" 
            value={overview.totalEnrolled} 
            icon={<Book />} 
          />
          <StatCard 
            title="Completed Courses" 
            value={overview.totalCompleted} 
            icon={<CheckCircle />} 
          />
          <StatCard 
            title="Certificates Earned" 
            value={overview.totalCertificates} 
            icon={<Award />} 
          />
          <StatCard 
            title="Watch Time (hrs)" 
            value={Math.round((overview.totalWatchTime || 0) / 3600)} 
            icon={<Clock />} 
          />
        </div>

          {lastCourse && (
              <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-2">
                      <div className="p-6">
                          <h2 className="text-xl font-bold font-headline mb-2">Resume Learning</h2>
                          <h3 className="text-lg font-semibold">{lastCourse.title}</h3>
                          <p className="text-muted-foreground mt-2 mb-4">
                            {lastCourse.shortDescription || lastCourse.description?.substring(0, 100) + "..."}
                          </p>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{Math.round(lastCourse.progress || 0)}%</span>
                            </div>
                            <Progress value={lastCourse.progress || 0} className="w-full" />
                          </div>
                          <Button asChild>
                              <Link href={`/student/courses/${lastCourse._id}/learn`}>Continue Learning</Link>
                          </Button>
                      </div>
                       <div className="relative min-h-[200px] md:h-full">
                           {lastCourse.thumbnail?.url ? (
                             <Image 
                               src={`http://localhost:5000${lastCourse.thumbnail.url}`}
                               alt={lastCourse.title} 
                               fill
                               className="object-cover" 
                             />
                           ) : (
                             <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                               <Book className="w-16 h-16 text-gray-400" />
                             </div>
                           )}
                       </div>
                  </div>
              </Card>
          )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl sm:text-3xl md:text-3xl lg:text-3xl font-light font-headline">My Courses</h1>
            <Button variant="outline" asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </div>
          {myCourses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myCourses.slice(0, 6).map((enrollment: any) => {
                // Extract course data from enrollment
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
                      
                      {/* Show different buttons based on completion status */}
                      {(enrollment.progress?.overallProgress >= 100) || isCourseCompleted(course, enrollment.progress) ? (
                        <div className="flex gap-2 mt-2">
                          <Button className="flex-1" size="sm" asChild>
                            <Link href={`/learner/courses/${course._id}/learn`}>
                              Review
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewCertificate(course._id)}
                            className="flex-1"
                          >
                            <Award className="w-4 h-4 mr-1" />
                            Certificate
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full mt-2" size="sm" asChild>
                          <Link href={`/learner/courses/${course._id}/learn`}>
                            {enrollment.progress > 0 ? 'Continue' : 'Start'}
                          </Link>
                        </Button>
                      )}
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

        {/* Certificate Modal */}
        {selectedCertificate && (
          <CertificateModal
            isOpen={certificateModalOpen}
            onClose={() => {
              setCertificateModalOpen(false);
              setSelectedCertificate(null);
            }}
            certificate={selectedCertificate}
          />
        )}
      </div>
    </>
  );
}
