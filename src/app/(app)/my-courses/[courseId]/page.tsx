"use client";

import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Heart, PlayCircle, ShoppingCart, Star, FileText, HelpCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { coursesApi, cartApi, wishlistApi, studentApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
  status: string;
  isPublished: boolean;
  sections: any[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  level?: string;
  createdAt: string;
}

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [course, setCourse] = useState<BackendCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<{
    isEnrolled: boolean;
    enrollment?: any;
  }>({ isEnrolled: false });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await coursesApi.getCourse(params.courseId);
        
        if (response.course) {
          setCourse(response.course);
          
          // Check cart, wishlist, and enrollment status if user is authenticated
          if (currentUser && currentUser.role === 'learner') {
            try {
              const [cartResponse, wishlistResponse, enrollmentResponse] = await Promise.all([
                cartApi.checkInCart(params.courseId),
                wishlistApi.checkInWishlist(params.courseId),
                studentApi.getEnrollmentDetails(params.courseId).catch(() => ({ enrollment: null }))
              ]);
              
              setIsInCart(cartResponse.isInCart);
              setIsInWishlist(wishlistResponse.isInWishlist);
              setEnrollmentStatus({
                isEnrolled: !!enrollmentResponse.enrollment,
                enrollment: enrollmentResponse.enrollment
              });
            } catch (err) {
              console.error('Failed to check cart/wishlist/enrollment status:', err);
            }
          }
        } else {
          setError('Course not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch course:', err);
        setError(err.message || 'Failed to fetch course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.courseId, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    notFound();
  }

  if (!course.isPublished) {
    notFound();
  }

  // Server URL for images
  const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const courseImage = course.thumbnail?.url ? `${SERVER_BASE_URL}${course.thumbnail.url}` : null;
  const bannerImage = course.banner?.url ? `${SERVER_BASE_URL}${course.banner.url}` : null;

  // Check if user is enrolled
  const isEnrolled = enrollmentStatus.isEnrolled;

  const handleAddToCart = async () => {
    if (!currentUser || !course) return;
    
    try {
      setCartLoading(true);
      
      if (isInCart) {
        await cartApi.removeFromCart(course._id);
        setIsInCart(false);
        toast({ title: "Removed from cart!" });
      } else {
        await cartApi.addToCart(course._id);
        setIsInCart(true);
        toast({ title: "Added to cart!" });
      }
    } catch (error: any) {
      console.error('Cart operation failed:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update cart",
        variant: "destructive" 
      });
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!currentUser || !course) return;
    
    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        await wishlistApi.removeFromWishlist(course._id);
        setIsInWishlist(false);
        toast({ title: "Removed from wishlist!" });
      } else {
        await wishlistApi.addToWishlist(course._id);
        setIsInWishlist(true);
        toast({ title: "Added to wishlist!" });
      }
    } catch (error: any) {
      console.error('Wishlist operation failed:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update wishlist",
        variant: "destructive" 
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleEnrollNow = async () => {
    try {
      setLoading(true);
      const response = await studentApi.enrollInCourse(course._id);
      
      if (response.enrollment) {
        toast({ 
          title: "Enrolled successfully!",
          description: "You can now start learning this course."
        });
        
        // Update the enrollment status
        setEnrollmentStatus({
          isEnrolled: true,
          enrollment: response.enrollment
        });
        
        // Redirect to learning page
        router.push(`/learner/courses/${course._id}/learn`);
      } else {
        throw new Error(response.message || 'Failed to enroll');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({ 
        title: "Enrollment failed", 
        description: error.message || "Failed to enroll in course",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white relative">
        {bannerImage && (
          <div className="absolute inset-0">
            <img 
              src={bannerImage} 
              alt={course.title}
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Link href="/courses" className="hover:text-white">Courses</Link>
                <span>/</span>
                <span>{course.category.name}</span>
                <span>/</span>
                <span className="text-white">{course.title}</span>
              </div>

              <h1 className="text-4xl font-bold">{course.title}</h1>
              <p className="text-xl text-gray-200">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.ratings?.average?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-300">({course.ratings?.count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{course.enrolledStudents}</span>
                  <span className="text-gray-300">students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(course.totalDuration || 0)} total length</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  <span>{course.totalLectures} lectures</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {course.instructor.profileImage ? (
                    <AvatarImage src={`${SERVER_BASE_URL}${course.instructor.profileImage}`} />
                  ) : null}
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-300">Created by</p>
                  <p className="font-semibold">{course.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:sticky lg:top-6">
              <Card className="bg-white">
                <CardContent className="p-6">
                  {/* Preview Video/Image */}
                  <div className="relative aspect-video mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    {courseImage ? (
                      <img
                        src={courseImage}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <PlayCircle className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold">${course.price}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {currentUser && currentUser.role === 'learner' ? (
                      <>
                        {isEnrolled ? (
                          <>
                            <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                              <Check className="w-4 h-4 mr-2" />
                              Enrolled
                            </Button>
                            <Button className="w-full" asChild variant="outline">
                              <Link href={`/learner/courses/${course._id}/learn`}>
                                Continue Learning
                              </Link>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={handleEnrollNow} className="w-full">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Enroll Now
                            </Button>
                            <Button
                              onClick={handleAddToCart}
                              variant="outline"
                              className="w-full"
                              disabled={cartLoading}
                            >
                              {cartLoading ? 'Loading...' : (isInCart ? 'Remove from Cart' : 'Add to Cart')}
                            </Button>
                          </>
                        )}

                        <Button
                          onClick={handleWishlistToggle}
                          variant="ghost"
                          className="w-full"
                          disabled={wishlistLoading}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                          {wishlistLoading ? 'Loading...' : (isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist')}
                        </Button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-3">Please log in as a student to enroll</p>
                        <Button asChild className="w-full">
                          <Link href="/login">Login</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Course Includes */}
                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">This course includes:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-green-600" />
                        <span>{formatDuration(course.totalDuration || 0)} on-demand video</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span>{course.totalLectures} lectures</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">What you'll learn</h2>
                <div className="grid md:grid-cols-2 gap-2">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course content */}
            {course.sections && course.sections.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Course content</h2>
                <div className="text-sm text-gray-600">
                  {course.sections.length} sections • {course.totalLectures} lectures • {formatDuration(course.totalDuration || 0)} total length
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {course.sections.map((section: any, index: number) => (
                    <AccordionItem key={index} value={`section-${index}`} className="border rounded-lg">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{section.title}</span>
                          <span className="text-sm text-gray-500">
                            {section.lectures?.length || 0} lectures
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {section.lectures?.map((lecture: any, lectureIndex: number) => (
                          <div key={lectureIndex} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{lecture.title}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDuration(lecture.duration || 0)}
                            </span>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>
            </div>

            {/* Instructor Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About the Instructor</h2>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  {course.instructor.profileImage ? (
                    <AvatarImage src={`${SERVER_BASE_URL}${course.instructor.profileImage}`} />
                  ) : null}
                  <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{course.instructor.name}</h3>
                  {course.instructor.title && (
                    <p className="text-blue-600 font-medium">{course.instructor.title}</p>
                  )}
                  {course.instructor.bio && (
                    <p className="text-gray-600 leading-relaxed">{course.instructor.bio}</p>
                  )}
                  
                  {/* Instructor Stats */}
                  <div className="flex gap-6 text-sm text-gray-500 pt-2">
                    <span>⭐ {course.instructor.rating || 0} instructor rating</span>
                    <span>👥 {course.instructor.totalStudents || 0} students</span>
                    <span>🎓 {course.instructor.totalCourses || 0} courses</span>
                  </div>

                  {/* Social Links */}
                  {(course.instructor.website || course.instructor.linkedin || course.instructor.twitter) && (
                    <div className="flex flex-wrap gap-4 pt-2">
                      {course.instructor.website && (
                        <a 
                          href={course.instructor.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          🌐 Website
                        </a>
                      )}
                      {course.instructor.linkedin && (
                        <a 
                          href={course.instructor.linkedin.startsWith('http') ? course.instructor.linkedin : `https://linkedin.com/in/${course.instructor.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                      {course.instructor.twitter && (
                        <a 
                          href={course.instructor.twitter.startsWith('http') ? course.instructor.twitter : `https://twitter.com/${course.instructor.twitter.replace('@', '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          🐦 Twitter
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}