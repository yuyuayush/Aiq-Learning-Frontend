'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { studentApi, coursesApi, videoApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, ChevronLeft, ChevronsUpDown, FileText, HelpCircle, LayoutPanelLeft, Menu, PlayCircle, History, ShieldQuestion, Star, PanelRightOpen, Video, Book, CheckCircle, Clock, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { certificateApi } from '@/lib/api';
import { isCourseCompleted } from '@/lib/course-utils';
import Chatbot from '@/components/ui/Chatbot';

interface CourseData {
  course: any;
  enrollment: any;
  progress: any;
  currentLecture: any;
}

export default function LearnerCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, isInitialized } = useAuth();
  const { toast } = useToast();
  
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [certificateGenerationAttempted, setCertificateGenerationAttempted] = useState(false);
  const [expandedSectionKey, setExpandedSectionKey] = useState<string | undefined>(undefined);

  const courseId = params?.courseId as string;

  useEffect(() => {
    // Only load course data if we have authenticated user and proper initialization
    if (courseId && currentUser && isInitialized) {
      loadCourseData();
    }
  }, [courseId, currentUser, isInitialized]);

  const loadCourseData = async () => {
    // Don't load if user is not authenticated or already loading
    if (!currentUser || !isInitialized || isLoadingCourse) {
      return;
    }

    try {
      setIsLoadingCourse(true);
      setLoading(true);

      // For students, get course data from enrollment instead of direct course API
      const enrollmentRes = await studentApi.getEnrollmentDetails(courseId);
      
      if (!enrollmentRes.isEnrolled || !enrollmentRes.enrollment) {
        // User not enrolled, redirect to course page to enroll
        router.push(`/courses/${courseId}`);
        return;
      }

      const enrollment = enrollmentRes.enrollment;
      const course = enrollment.course;

      // Debug logging
      console.log('Course data:', course);
      console.log('Course sections:', course?.sections);
      if (course?.sections?.[0]?.lectures?.[0]) {
        const firstLecture = course.sections[0].lectures[0];
        console.log('First lecture:', firstLecture);
        console.log('First lecture video:', firstLecture.video);
      }

      // Get progress separately (this might fail if no progress exists yet, which is fine)
      let progress = null;
      try {
        const progressRes = await studentApi.getCourseProgress(courseId);
        progress = progressRes.progress;
        console.log('📊 Loaded progress data:', {
          progress,
          completedLessons: progress?.completedLessons,
          isArray: Array.isArray(progress?.completedLessons),
          count: progress?.completedLessons?.length
        });
      } catch (error) {
        console.log('No progress found yet, starting fresh');
      }

      // Find current lecture (last accessed or first incomplete)
      let sectionIdx = 0;
      let lectureIdx = 0;

      // Prefer locally saved position to preserve state across refreshes
      if (typeof window !== 'undefined') {
        const savedSection = localStorage.getItem(`course_${courseId}_sectionIndex`);
        const savedLecture = localStorage.getItem(`course_${courseId}_lectureIndex`);
        if (savedSection !== null && savedLecture !== null) {
          sectionIdx = parseInt(savedSection, 10);
          lectureIdx = parseInt(savedLecture, 10);
        }
      }

      if (progress && progress.currentSection !== undefined && progress.currentLecture !== undefined && expandedSectionKey === undefined) {
        sectionIdx = progress.currentSection;
        lectureIdx = progress.currentLecture;
      } else if (course.sections && course.sections.length > 0) {
        // Find first incomplete lecture
        for (let s = 0; s < course.sections.length; s++) {
          const section = course.sections[s];
          if (section.lectures) {
            for (let l = 0; l < section.lectures.length; l++) {
              const lecture = section.lectures[l];
              const lectureProgress = progress?.lecturesCompleted?.find(
                (lp: any) => lp.sectionIndex === s && lp.lectureIndex === l
              );
              if (!lectureProgress?.completed) {
                sectionIdx = s;
                lectureIdx = l;
                break;
              }
            }
          }
          if (sectionIdx === s && lectureIdx >= 0) break;
        }
      }

      const currentLecture = course.sections?.[sectionIdx]?.lectures?.[lectureIdx] || null;

      setCourseData({
        course,
        enrollment,
        progress,
        currentLecture
      });

      setCurrentSectionIndex(sectionIdx);
      setCurrentLectureIndex(lectureIdx);
      setExpandedSectionKey(`item-${sectionIdx}`);

      // Reset certificate generation flag when course data loads
      // This allows certificate generation for newly completed courses
      setCertificateGenerationAttempted(false);

    } catch (error: any) {
      console.error('Failed to load course data:', error);
      
      // If it's an authentication error, don't show toast and let auth system handle it
      if (error?.status === 401) {
        console.log('Authentication error - will be handled by auth system');
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load course data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsLoadingCourse(false);
    }
  };

  const selectLecture = (sectionIndex: number, lectureIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentLectureIndex(lectureIndex);
    setExpandedSectionKey(`item-${sectionIndex}`);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`course_${courseId}_sectionIndex`, String(sectionIndex));
      localStorage.setItem(`course_${courseId}_lectureIndex`, String(lectureIndex));
    }
    
    if (courseData?.course.sections?.[sectionIndex]?.lectures?.[lectureIndex]) {
      setCourseData(prev => prev ? {
        ...prev,
        currentLecture: prev.course.sections[sectionIndex].lectures[lectureIndex]
      } : null);
    }
  };

  const handleLectureSelect = (sectionId: string, lectureId: string) => {
    if (!courseData?.course.sections) return;
    
    // Find section and lecture indices
    let sectionIdx = -1;
    let lectureIdx = -1;
    
    for (let s = 0; s < courseData.course.sections.length; s++) {
      if (courseData.course.sections[s]._id === sectionId) {
        sectionIdx = s;
        for (let l = 0; l < courseData.course.sections[s].lectures.length; l++) {
          if (courseData.course.sections[s].lectures[l]._id === lectureId) {
            lectureIdx = l;
            break;
          }
        }
        break;
      }
    }
    
    if (sectionIdx >= 0 && lectureIdx >= 0) {
      selectLecture(sectionIdx, lectureIdx);
    }
  };

  const toggleLectureComplete = async () => {
    if (!courseData?.currentLecture || !courseId) return;

    try {
      const section = courseData.course.sections[currentSectionIndex];
      const lecture = courseData.currentLecture;
      const isCompleted = isCurrentLectureCompleted;
      
      // Check if course was already completed before this action
      const wasCourseAlreadyCompleted = isCourseCompleted(courseData.course, courseData.progress);

      if (isCompleted) {
        // Unmark as completed and subtract duration
        const lectureDuration = lecture.duration || 0; // Duration in seconds
        await studentApi.unmarkLessonComplete(
          courseId,
          section._id,
          lecture._id,
          lectureDuration
        );
        toast({
          title: "Progress Updated",
          description: "Lecture unmarked as complete.",
        });
      } else {
        // Mark as completed with duration
        const lectureDuration = lecture.duration || 0; // Duration in seconds
        await studentApi.markLessonComplete(
          courseId,
          section._id,
          lecture._id,
          lectureDuration
        );
        toast({
          title: "Progress Saved", 
          description: "Lecture marked as complete!",
        });
      }

      // Reload course data to update progress
      console.log('🔄 Reloading course data after toggle completion...');
      await loadCourseData();
      console.log('✅ Course data reloaded after toggle completion');

      // Check if course is now completed and generate certificate
      // Only check if we just marked a lecture as complete AND course wasn't already completed
      if (!isCompleted && !wasCourseAlreadyCompleted) { 
        // Add a small delay to ensure progress is fully updated
        setTimeout(() => {
          checkCourseCompletionAndGenerateCertificate();
        }, 500);
      }

    } catch (error: any) {
      console.error('Failed to update lecture completion:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const markLectureComplete = async () => {
    if (!courseData?.currentLecture || !courseId || isCurrentLectureCompleted) return;

    try {
      const section = courseData.course.sections[currentSectionIndex];
      const lecture = courseData.currentLecture;
      const lectureDuration = lecture.duration || 0; // Duration in seconds
      
      // Check if course was already completed before this action
      const wasCourseAlreadyCompleted = isCourseCompleted(courseData.course, courseData.progress);

      await studentApi.markLessonComplete(
        courseId,
        section._id,
        lecture._id,
        lectureDuration
      );

      toast({
        title: "Progress Saved", 
        description: "Lecture completed!",
      });

      // Reload course data to update progress
      await loadCourseData();

      // Check if course is now completed and generate certificate
      // Only trigger if course wasn't already completed before this action
      if (!wasCourseAlreadyCompleted) {
        // Add a small delay to ensure progress is fully updated  
        setTimeout(() => {
          checkCourseCompletionAndGenerateCertificate();
        }, 500);
      }

    } catch (error: any) {
      console.error('Failed to mark lecture complete:', error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to check if all lectures are completed and generate certificate
  const checkCourseCompletionAndGenerateCertificate = async () => {
    if (!courseData?.course || !courseData?.progress) return;

    const { course, progress } = courseData;
    
    // Check if course is completed using utility function
    const isCompleted = isCourseCompleted(course, progress);
    
    if (isCompleted) {
      console.log('🎉 Course completed! Checking certificate status...');
      
      // Skip if we've already attempted certificate generation in this session
      if (certificateGenerationAttempted) {
        console.log('📜 Certificate generation already attempted in this session, skipping...');
        return;
      }
      
      try {
        // Check if certificate already exists
        const existingCert = await certificateApi.getCertificateByCourse(courseId);
        
        // Handle service unavailable case
        if (existingCert.serviceUnavailable) {
          console.log('📜 Certificate service unavailable, showing completion message');
          setCertificateGenerationAttempted(true);
          toast({
            title: "Congratulations! 🎉",
            description: "You've completed this course!",
          });
          return;
        }
        
        if (existingCert.certificate) {
          console.log('📜 Certificate already exists');
          setCertificateGenerationAttempted(true);
          toast({
            title: "Congratulations! 🎉",
            description: "You've completed this course! Your certificate is ready to view in your dashboard.",
          });
        } else {
          // Generate new certificate only if we haven't attempted it yet
          try {
            setCertificateGenerationAttempted(true);
            const generateResult = await certificateApi.generateCertificate(courseId);
            
            if (generateResult.serviceUnavailable) {
              toast({
                title: "Congratulations! 🎉",
                description: "You've completed this course!",
              });
            } else {
              console.log('📜 Certificate generated successfully');
              toast({
                title: "Congratulations! 🎉",
                description: "You've completed this course and earned a certificate! View it in your dashboard.",
              });
            }
          } catch (certError: any) {
            console.error('Failed to generate certificate:', certError);
            
            // Still show congratulations even if certificate generation fails
            toast({
              title: "Congratulations! 🎉", 
              description: "You've completed this course! Certificate will be available soon.",
            });
          }
        }
      } catch (error: any) {
        console.error('Failed to check for existing certificate:', error);
        
        // Skip fallback generation if already attempted or if it's a permissions error
        if (!certificateGenerationAttempted && !(error.status === 403 || error.message?.includes('Insufficient permissions'))) {
          try {
            setCertificateGenerationAttempted(true);
            await certificateApi.generateCertificate(courseId);
            console.log('📜 Certificate generated successfully (fallback)');
            
            toast({
              title: "Congratulations! 🎉",
              description: "You've completed this course and earned a certificate! View it in your dashboard.",
            });
          } catch (certError: any) {
            console.error('Failed to generate certificate (fallback):', certError);
            
            // Still show congratulations
            toast({
              title: "Congratulations! 🎉",
              description: "You've completed this course! Certificate will be available soon.",
            });
          }
        } else {
          // Just show congratulations for permissions errors
          toast({
            title: "Congratulations! 🎉",
            description: "You've completed this course!",
          });
        }
      }
    }
  };

  // Show loading screen while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <div className="animate-pulse flex-1">
          <div className="h-16 bg-muted border-b"></div>
          <div className="flex">
            <div className="w-80 bg-muted border-r"></div>
            <div className="flex-1 p-8">
              <div className="aspect-video bg-muted rounded mb-4"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="w-80 bg-muted border-l"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only redirect after auth is initialized and user is confirmed to be null
  if (isInitialized && !currentUser) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <div className="animate-pulse flex-1">
          <div className="h-16 bg-muted border-b"></div>
          <div className="flex">
            <div className="w-80 bg-muted border-r"></div>
            <div className="flex-1 p-8">
              <div className="aspect-video bg-muted rounded mb-4"></div>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
            <div className="w-80 bg-muted border-l"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData && isInitialized && currentUser) {
    // Show loading while we wait for course data to load
    if (isLoadingCourse) {
      return (
        <div className="flex h-screen bg-background text-foreground">
          <div className="animate-pulse flex-1">
            <div className="h-16 bg-muted border-b"></div>
            <div className="flex">
              <div className="w-80 bg-muted border-r"></div>
              <div className="flex-1 p-8">
                <div className="h-[60vh] bg-muted rounded mb-4"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
              <div className="w-80 bg-muted border-l"></div>
            </div>
          </div>
        </div>
      );
    }

    // Course not found or error state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Button asChild>
            <Link href="/learner/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { course, enrollment, progress, currentLecture } = courseData!;
  const activeSection = course.sections?.[currentSectionIndex];
  const activeLecture = currentLecture;

  // Check if current lecture is completed
  const isCurrentLectureCompleted = Array.isArray(progress?.completedLessons) 
    ? progress.completedLessons.some(
        (lesson: any) => lesson.sectionIndex === currentSectionIndex && lesson.lessonIndex === currentLectureIndex
      )
    : false;

  // Main Content Component - Memoized to prevent unnecessary re-renders
  const MainContent = React.memo(({ lecture }: { lecture: any }) => {
    if (!lecture) {
      return (
        <div className="flex-grow flex items-center justify-center bg-muted">
          <p>Select a lecture to begin.</p>
        </div>
      );
    }

    switch (lecture.type) {
      case 'video':
        return <VideoContainer lecture={lecture} onVideoEnded={markLectureComplete} />;
      case 'quiz':
        return <QuizContainer lecture={lecture} onQuizComplete={markLectureComplete} />;
      case 'note':
        return (
          <div className="p-8">
            <Card>
              <CardContent className="p-6">
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: (lecture.content || lecture.note?.content || '') }}
                />
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div className="p-8">Unsupported lecture type.</div>;
    }
  });

  // Course Curriculum Component
  const CourseCurriculum = () => (
    <>
      <h2 className="font-semibold mb-4 px-4">{course.title}</h2>
      <Accordion 
        type="single" 
        collapsible 
        value={expandedSectionKey ?? `item-${currentSectionIndex}`} 
        onValueChange={(val) => setExpandedSectionKey(val)}
        className="w-full"
      >
        {course.sections?.map((section: any, index: number) => (
          <AccordionItem value={`item-${index}`} key={section._id}>
            <AccordionTrigger className="px-4">{section.title}</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-sm">
                {section.lectures?.map((lecture: any) => {
                  const quizStatus = getQuizStatus(lecture);
                  const isGradedQuiz = lecture.type === 'quiz' && lecture.quiz?.isGraded;
                  
                  return (
                    <li key={lecture._id}>
                      <button 
                        onClick={() => handleLectureSelect(section._id, lecture._id)}
                        className={cn(
                          "w-full text-left px-4 py-2 flex items-center gap-3 rounded-none hover:bg-muted",
                          currentLecture?._id === lecture._id && "bg-primary/10 text-primary font-semibold"
                        )}
                      >
                        {lecture.type === 'video' && <PlayCircle className="w-4 h-4 shrink-0"/>}
                        {lecture.type === 'quiz' && <HelpCircle className="w-4 h-4 shrink-0"/>}
                        {lecture.type === 'note' && <FileText className="w-4 h-4 shrink-0"/>}
                        <div className="flex-grow flex items-center gap-2">
                          <span>{lecture.title}</span>
                          {lecture.type === 'quiz' && (
                            <Badge 
                              variant={isGradedQuiz ? "destructive" : "secondary"} 
                              className="text-xs px-1.5 py-0.5"
                            >
                              {isGradedQuiz ? 'G' : 'U'}
                            </Badge>
                          )}
                          {quizStatus && isGradedQuiz && (
                            <Badge 
                              variant={quizStatus.passed ? "default" : "outline"} 
                              className={cn(
                                "text-xs px-1.5 py-0.5",
                                quizStatus.passed ? "bg-green-600 hover:bg-green-700" : "border-red-500 text-red-600"
                              )}
                            >
                              {quizStatus.passed ? 'P' : 'F'}
                            </Badge>
                          )}
                        </div>
                        {(() => {
                          // Check if this specific lecture is completed
                          const isLectureCompleted = Array.isArray(progress?.completedLessons) 
                            ? progress.completedLessons.some((lesson: any) => {
                                // Find the section and lecture indices for this lecture
                                for (let sectionIdx = 0; sectionIdx < course.sections.length; sectionIdx++) {
                                  const sectionLectures = course.sections[sectionIdx].lectures || [];
                                  for (let lectureIdx = 0; lectureIdx < sectionLectures.length; lectureIdx++) {
                                    if (sectionLectures[lectureIdx]._id === lecture._id) {
                                      return lesson.sectionIndex === sectionIdx && lesson.lessonIndex === lectureIdx;
                                    }
                                  }
                                }
                                return false;
                              })
                            : false;
                          
                          return (
                            <Check className={cn(
                              "w-4 h-4 text-green-500 transition-opacity duration-200", 
                              isLectureCompleted ? 'opacity-100' : 'opacity-0'
                            )} />
                          );
                        })()}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );

  // Helper function to get quiz status for a lecture
  const getQuizStatus = (lecture: any) => {
    if (lecture.type !== 'quiz' || !currentUser?.id) return null;
    
    const lectureKey = `quiz_${lecture._id}_${currentUser.id}`;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${lectureKey}_results`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  // Right Sidebar Content Component
  function RightSidebarContent() {
    if (!activeSection) return null;
    return (
      <Card className="h-full border-0 rounded-none">
        <CardHeader className="shrink-0">
          <CardTitle>{activeSection?.title || 'Lectures'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="space-y-1">
            {activeSection?.lectures?.map((lecture: any) => {
              const quizStatus = getQuizStatus(lecture);
              const isGradedQuiz = lecture.type === 'quiz' && lecture.quiz?.isGraded;
              
              return (
                <li key={lecture._id}>
                  <button 
                    onClick={() => handleLectureSelect(activeSection._id, lecture._id)}
                    className={cn(
                      "w-full text-left p-3 flex items-center gap-3 transition-colors",
                      currentLecture?._id === lecture._id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted"
                    )}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {lecture.type === 'video' && <PlayCircle className="w-5 h-5"/>}
                      {lecture.type === 'quiz' && <HelpCircle className="w-5 h-5"/>}
                      {lecture.type === 'note' && <FileText className="w-5 h-5"/>}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{lecture.title}</p>
                        {lecture.type === 'quiz' && (
                          <Badge 
                            variant={isGradedQuiz ? "destructive" : "secondary"} 
                            className="text-xs px-1.5 py-0.5"
                          >
                            {isGradedQuiz ? 'Graded' : 'Ungraded'}
                          </Badge>
                        )}
                        {quizStatus && isGradedQuiz && (
                          <Badge 
                            variant={quizStatus.passed ? "default" : "outline"} 
                            className={cn(
                              "text-xs px-1.5 py-0.5",
                              quizStatus.passed ? "bg-green-600 hover:bg-green-700" : "border-red-500 text-red-600"
                            )}
                          >
                            {quizStatus.passed ? 'Pass' : 'Fail'}
                          </Badge>
                        )}
                      </div>
                      {typeof lecture.duration === 'number' && (
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            const totalSeconds = lecture.duration;
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            const seconds = Math.floor(totalSeconds % 60);
                            
                            if (hours > 0) {
                              return seconds > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${hours}h ${minutes}m`;
                            } else if (minutes > 0) {
                              return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
                            } else {
                              return `${seconds}s`;
                            }
                          })()}
                        </p>
                      )}
                    </div>
                    <Check className={cn("w-5 h-5 text-green-500", false ? 'opacity-100' : 'opacity-0')} />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar - Course Sections */}
      <aside className={cn(
        "bg-background border-r flex-col transition-all duration-300 ease-in-out hidden md:flex",
        isLeftSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="h-16 flex items-center px-4 border-b shrink-0 justify-between">
          <Button variant="ghost" asChild>
            <Link href={`/courses/${course._id}`} className="font-bold text-lg whitespace-nowrap">
              <ChevronLeft className="mr-2 h-5 w-5"/>
              Exit Course
            </Link>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <CourseCurriculum />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
              className="hidden md:inline-flex"
            >
              <Menu className="w-4 h-4"/>
            </Button>
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon"><ChevronsUpDown className="w-4 h-4"/></Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <aside className="flex flex-col h-full">
                    <div className="h-16 flex items-center px-4 border-b shrink-0">
                      <Button variant="ghost" asChild>
                        <Link href={`/courses/${course._id}`} className="font-bold text-lg">
                          <ChevronLeft className="mr-2 h-5 w-5"/>
                          Exit Course
                        </Link>
                      </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4">
                      <CourseCurriculum />
                    </div>
                  </aside>
                </SheetContent>
              </Sheet>
            </div>
            <h1 className="text-xl font-semibold truncate">{activeLecture?.title || course.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={toggleLectureComplete}
              variant={isCurrentLectureCompleted ? "default" : "default"}
              className={cn(
                isCurrentLectureCompleted && "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {isCurrentLectureCompleted ? (
                <>
                  Completed <CheckCircle className="ml-2 w-4 h-4"/>
                </>
              ) : (
                <>
                  Mark as Complete <Check className="ml-2 w-4 h-4"/>
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="hidden lg:inline-flex"
            >
              <PanelRightOpen className="w-4 h-4"/>
            </Button>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon"><LayoutPanelLeft className="w-4 h-4"/></Button>
                </SheetTrigger>
                <SheetContent side="right" className="p-0 w-80">
                  <RightSidebarContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <MainContent 
            key={`content-${activeLecture?._id || `${currentSectionIndex}-${currentLectureIndex}`}`}
            lecture={activeLecture} 
          />
        </div>
      </main>

      {/* Right Sidebar - Lectures in Section */}
      <aside className={cn(
        "bg-background border-l flex-col transition-all duration-300 ease-in-out hidden lg:flex",
        isRightSidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <RightSidebarContent />
      </aside>

      {/* Chatbot - Floating Assistant */}
      <Chatbot />
    </div>
  );
}

// Quiz Container Component
const QuizContainer = ({ lecture, onQuizComplete }: { lecture: any; onQuizComplete?: () => void }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Use lecture ID as key for persistent state across re-renders
  const lectureKey = `quiz_${lecture._id}_${currentUser?.id}`;
  
  // Initialize state with localStorage persistence
  const [view, setView] = useState<'details' | 'taking' | 'results'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${lectureKey}_view`);
      return saved as 'details' | 'taking' | 'results' || 'details';
    }
    return 'details';
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${lectureKey}_question`);
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });
  
  const [selectedAnswers, setSelectedAnswers] = useState<{[questionIndex: number]: number[]}>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${lectureKey}_answers`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  
  const [quizResults, setQuizResults] = useState<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    passed: boolean;
    rawScore?: number;
    questionResults?: { questionIndex: number; score: number; maxScore: number; isCorrect: boolean }[];
    scoredMarks?: number;
    totalMarks?: number;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${lectureKey}_results`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Persist state changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${lectureKey}_view`, view);
    }
  }, [view, lectureKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${lectureKey}_question`, currentQuestionIndex.toString());
    }
  }, [currentQuestionIndex, lectureKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${lectureKey}_answers`, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, lectureKey]);

  useEffect(() => {
    if (typeof window !== 'undefined' && quizResults) {
      localStorage.setItem(`${lectureKey}_results`, JSON.stringify(quizResults));
    }
  }, [quizResults, lectureKey]);

  const questions = lecture.quiz?.questions || lecture.questions || [];
  const isGraded = lecture.quiz?.isGraded || lecture.graded || false;
  const passingScore = lecture.quiz?.passingScore || lecture.passingScore || 70;

  // Debug quiz data
  console.log('📝 QuizContainer - Raw lecture data:', lecture);
  console.log('📝 QuizContainer - Parsed questions:', questions);
  console.log('📝 QuizContainer - Questions length:', questions.length);
  if (questions.length > 0) {
    console.log('📝 QuizContainer - First question:', questions[0]);
    questions.forEach((q: any, index: number) => {
      console.log(`📝 Question ${index}:`, {
        type: q.type,
        correctAnswers: q.correctAnswers,
        correctAnswer: q.correctAnswer,
        options: q.options,
        optionsWithCorrectFlags: q.options?.map((opt: any, i: number) => ({
          text: opt.text || opt,
          isCorrect: opt.isCorrect,
          index: i
        }))
      });
    });
  }

  const handleAnswerSelect = (questionIndex: number, optionIndex: number, isMultiple: boolean) => {
    setSelectedAnswers(prev => {
      const current = prev[questionIndex] || [];
      
      if (isMultiple) {
        // Multiple choice: toggle the option
        const newAnswers = current.includes(optionIndex)
          ? current.filter(i => i !== optionIndex)
          : [...current, optionIndex].sort();
        return { ...prev, [questionIndex]: newAnswers };
      } else {
        // Single choice: replace with new selection
        return { ...prev, [questionIndex]: [optionIndex] };
      }
    });
  };

  const submitQuiz = () => {
    if (questions.length === 0) return;

    let totalScore = 0;
    const questionResults: { questionIndex: number; score: number; maxScore: number; isCorrect: boolean }[] = [];
    
    questions.forEach((question: any, qIndex: number) => {
      const userAnswers = selectedAnswers[qIndex] || [];
      
      // Handle MongoDB format where correctAnswers might be array or single value
      let correctOptions: number[] = [];
      if (Array.isArray(question.correctAnswers)) {
        correctOptions = question.correctAnswers;
      } else if (typeof question.correctAnswers === 'number') {
        correctOptions = [question.correctAnswers];
      } else if (question.correctAnswer !== undefined) {
        // Fallback for single correctAnswer field
        correctOptions = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
      } else {
        // Last resort: check options for isCorrect flag
        correctOptions = question.options
          .map((opt: any, optIndex: number) => opt.isCorrect ? optIndex : -1)
          .filter((index: number) => index !== -1);
      }

      console.log(`📝 Question ${qIndex} scoring:`, {
        type: question.type,
        userAnswers,
        correctOptions,
        rawCorrectAnswers: question.correctAnswers
      });

      const isMultiple = question.type === 'multiple-choice' || question.type === 'multiple';
      let questionScore = 0;
      let isQuestionCorrect = false;

      if (isMultiple) {
        // Multiple choice scoring rules:
        // - 0 if any wrong answer is selected (regardless of correct selections)
        // - 1 if all correct answers are selected and no wrong answers
        // - Otherwise: (correct selected / total correct answers) rounded to 2 decimals
        const hasWrongAnswers = userAnswers.some(answer => !correctOptions.includes(answer));
        
        if (hasWrongAnswers) {
          // Any wrong answer selected = 0 marks
          questionScore = 0;
        } else if (userAnswers.length === 0) {
          // No answer selected = 0 marks
          questionScore = 0;
        } else {
          // Only correct answers selected
          const correctSelected = userAnswers.filter(answer => correctOptions.includes(answer)).length;
          const totalCorrect = correctOptions.length;
          
          if (correctSelected === totalCorrect) {
            // All correct answers selected = 1 mark
            questionScore = 1;
            isQuestionCorrect = true;
          } else {
            // Partial correct: (correct selected / total correct) rounded to 2 decimals
            questionScore = Math.round((correctSelected / totalCorrect) * 100) / 100;
            isQuestionCorrect = false; // Partial credit is not considered "correct"
          }
        }
      } else {
        // Single choice: either 1 or 0
        const isCorrect = userAnswers.length === 1 && correctOptions.includes(userAnswers[0]);
        questionScore = isCorrect ? 1 : 0;
        isQuestionCorrect = isCorrect;
      }

      console.log(`📝 Question ${qIndex} result:`, {
        score: questionScore,
        isCorrect: isQuestionCorrect
      });

      totalScore += questionScore;
      questionResults.push({
        questionIndex: qIndex,
        score: questionScore,
        maxScore: 1,
        isCorrect: isQuestionCorrect
      });
    });

    // Total marks scorable = number of questions
    // Scored marks = addition of each question score
    // Percentage = (scored marks / total marks) * 100
    const totalMarks = questions.length;
    const scoredMarks = totalScore;
    const percentageScore = Math.round((scoredMarks / totalMarks) * 100);
    const passed = !isGraded || percentageScore >= 75; // Pass threshold is 75%

    const results = {
      score: percentageScore,
      totalQuestions: questions.length,
      correctAnswers: questionResults.filter(r => r.isCorrect).length,
      passed,
      rawScore: totalScore,
      questionResults,
      scoredMarks: scoredMarks,
      totalMarks: totalMarks
    };

    // Set results and view
    setQuizResults(results);
    setView('results');
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResults(null);
    setView('details');
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${lectureKey}_view`);
      localStorage.removeItem(`${lectureKey}_question`);
      localStorage.removeItem(`${lectureKey}_answers`);
      localStorage.removeItem(`${lectureKey}_results`);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <ShieldQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quiz Questions</h3>
            <p className="text-muted-foreground">This quiz hasn't been set up yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'details') {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <ShieldQuestion className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-2xl font-bold mt-2">{lecture.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {lecture.description || `Complete this quiz with ${questions.length} questions`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              {isGraded && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{passingScore}%</div>
                  <div className="text-sm text-muted-foreground">Pass Score</div>
                </div>
              )}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{isGraded ? 'Graded' : 'Practice'}</div>
                <div className="text-sm text-muted-foreground">Quiz Type</div>
              </div>
            </div>
            
            <div className="text-center">
              <Button onClick={() => setView('taking')} size="lg">
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'taking') {
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const userAnswers = selectedAnswers[currentQuestionIndex] || [];
    const canProceed = userAnswers.length > 0;

    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-32" />
            </div>
            <CardTitle className="text-xl">{currentQuestion.question || currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option: any, optIndex: number) => {
                const isSelected = userAnswers.includes(optIndex);
                const isMultiple = currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'multiple';
                
                return (
                  <div
                    key={optIndex}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-colors",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, optIndex, isMultiple)}
                  >
                    <div className="flex items-center gap-3">
                      {isMultiple ? (
                        <Checkbox checked={isSelected} />
                      ) : (
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2",
                          isSelected ? "border-primary bg-primary" : "border-border"
                        )} />
                      )}
                      <span className="flex-1">{typeof option === 'string' ? option : option.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {isLastQuestion ? (
                <Button 
                  onClick={submitQuiz}
                  disabled={!canProceed}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button 
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  disabled={!canProceed}
                >
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'results' && quizResults) {
    console.log('🎯 Rendering quiz results:', { view, quizResults });
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className={cn(
              "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
              isGraded 
                ? (quizResults.passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")
                : "bg-blue-100 text-blue-600"
            )}>
              {isGraded 
                ? (quizResults.passed ? <CheckCircle className="w-8 h-8" /> : <X className="w-8 h-8" />)
                : <HelpCircle className="w-8 h-8" />
              }
            </div>
            <CardTitle className="text-2xl font-bold">
              {isGraded 
                ? (quizResults.passed ? 'Congratulations!' : 'Keep Practicing')
                : 'Quiz Completed!'
              }
            </CardTitle>
            <CardDescription>
              {isGraded 
                ? (quizResults.passed 
                    ? 'You have successfully completed this quiz!'
                    : `You need ${passingScore}% to pass this quiz.`
                  )
                : 'You have completed this practice quiz. Review your answers and retake if needed.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={cn(
              "grid gap-4 text-center",
              isGraded ? "grid-cols-1 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
            )}>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{quizResults.score}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{quizResults.scoredMarks?.toFixed(1) || quizResults.rawScore?.toFixed(1) || '0'}/{quizResults.totalMarks || quizResults.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Marks Scored</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{quizResults.correctAnswers}/{quizResults.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Fully Correct</div>
              </div>
              {isGraded && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className={cn(
                    "text-3xl font-bold",
                    quizResults.passed ? "text-green-600" : "text-red-600"
                  )}>
                    {quizResults.passed ? 'PASS' : 'FAIL'}
                  </div>
                  <div className="text-sm text-muted-foreground">Result</div>
                </div>
              )}
            </div>
            
            <div className="text-center space-x-4">
              <Button onClick={resetQuiz} variant="outline">
                Retake Quiz
              </Button>
              {quizResults.passed ? (
                <Button onClick={() => {
                  onQuizComplete?.();
                  // Clear quiz state after marking complete
                  setTimeout(() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem(`${lectureKey}_view`);
                      localStorage.removeItem(`${lectureKey}_results`);
                    }
                  }, 1000);
                }}>
                  Mark Lecture as Complete
                </Button>
              ) : isGraded && (
                <Button onClick={resetQuiz}>
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug fallback
  console.log('🚨 QuizContainer fallback:', { view, quizResults, lectureKey });
  
  // If view is results but no quizResults, show error or redirect to details
  if (view === 'results' && !quizResults) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="text-center p-8">
            <p className="text-red-600 mb-4">Error: Quiz results not found</p>
            <Button onClick={() => setView('details')}>
              Back to Quiz Details
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card>
        <CardContent className="text-center p-8">
          <p>Unknown quiz state: {view}</p>
          <Button onClick={() => setView('details')}>
            Reset Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Isolated Video Container Component - Completely isolated from sidebar state changes
const VideoContainer = React.memo(({ lecture, onVideoEnded }: { lecture: any; onVideoEnded?: () => void }) => {
  return (
    <div>
      <div className="bg-black w-full h-[60vh] flex items-center justify-center">
        <VideoPlayer 
          key={`video-${lecture._id || lecture.title}`}
          lecture={lecture} 
          onVideoEnded={onVideoEnded}
        />
      </div>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">About this video</h2>
        {lecture.description ? (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: lecture.description }}
          />
        ) : (
          <p className="text-muted-foreground">{lecture.title}</p>
        )}
      </div>
    </div>
  );
});

// Video Player Component - Memoized to prevent unnecessary re-renders
const VideoPlayer = React.memo(({ lecture, onVideoEnded }: { lecture: any; onVideoEnded?: () => void }) => {
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Always fetch fresh video details from api.video when we have apiVideoId
  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (lecture.video?.apiVideoId) {
        try {
          setLoading(true);
          const response = await videoApi.getVideoDetails(lecture.video.apiVideoId);
          if (response.video) {
            setVideoDetails(response.video);
          }
        } catch (error: any) {
          console.error('Error fetching fresh video details:', error);
          // If API call fails, we'll fall back to stored URLs
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVideoDetails();
  }, [lecture.video?.apiVideoId]);

  // Listen for video end events from iframe using postMessage API
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check if message is from api.video iframe and indicates video ended
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'video.ended' || event.data.event === 'ended') {
          console.log('Video ended detected via postMessage');
          onVideoEnded?.();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onVideoEnded]);

  // Get the best available video URL from api.video data
  const getVideoUrl = () => {
    // Use fetched video details if available (fresh from API.video)
    if (videoDetails?.assets?.iframe) {
      const match = videoDetails.assets.iframe.match(/src="([^"]+)"/);
      return match ? match[1] : null;
    }
    
    if (videoDetails?.assets?.player) {
      return videoDetails.assets.player;
    }
    
    // Fallback to stored URLs (might be outdated but better than nothing)
    if (lecture.video?.embedUrl) {
      const match = lecture.video.embedUrl.match(/src="([^"]+)"/);
      if (match) {
        return match[1];
      }
    }
    
    if (lecture.video?.playerUrl) {
      return lecture.video.playerUrl;
    }
    
    return null;
  };

  const videoUrl = getVideoUrl();

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center">
        <PlayCircle className="w-24 h-24 text-gray-600 animate-pulse" />
        <p className="mt-4 text-xl">Loading video...</p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center">
        <PlayCircle className="w-24 h-24 text-gray-600" />
        <p className="mt-4 text-xl">Video not available</p>
        {lecture.video?.apiVideoId && (
          <p className="text-sm text-gray-400 mt-2">Video ID: {lecture.video.apiVideoId}</p>
        )}
      </div>
    );
  }

  return (
    <iframe
      src={videoUrl}
      width="100%"
      height="100%"
      frameBorder="0"
      scrolling="no"
      allowFullScreen
      className="w-full h-full"
      title={lecture.title}
    />
  );
});