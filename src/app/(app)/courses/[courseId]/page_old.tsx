
"use client";

import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { dataApi } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Heart, PlayCircle, ShoppingCart, Star, FileText, HelpCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { coursesApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { currentUser, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const course = dataApi.getCourseById(params.courseId);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!course || !course.isPublished) {
    notFound();
  }

  const instructor = dataApi.getUserById(course.instructorId);
  const courseImage = PlaceHolderImages.find((p) => p.id === course.thumbnailId);
  const bannerImage = PlaceHolderImages.find((p) => p.id === course.bannerId);
  const instructorAvatar = PlaceHolderImages.find((p) => p.id === instructor?.avatarId);
  const totalLectures = course.sections.reduce((acc, section) => acc + section.lectures.length, 0);
  const totalDuration = course.sections.reduce((acc, section) => 
    acc + section.lectures.reduce((lecAcc, lecture) => lecAcc + lecture.duration, 0), 0);

  const reviews = dataApi.getReviewsByCourseId(course.id);
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const totalStudents = dataApi.getEnrollmentsByCourseId(course.id).length;

  if (!isClient || !currentUser) {
    // Render a placeholder or loading state on the server or if user is not loaded
    return <div>Loading...</div>;
  }
  
  const isEnrolled = dataApi.isUserEnrolled(currentUser.id, course.id);
  const isInCart = dataApi.isCourseInCart(currentUser.id, course.id);
  const isInWishlist = dataApi.isCourseInWishlist(currentUser.id, course.id);

  const handleAddToCart = () => {
    dataApi.addToCart(currentUser.id, course.id);
    refreshUser(); 
    toast({ title: "Added to cart", description: `"${course.title}" has been added to your cart.` });
    router.refresh();
  };
  
  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dataApi.removeFromWishlist(currentUser.id, course.id);
      toast({ title: "Removed from wishlist" });
    } else {
      dataApi.addToWishlist(currentUser.id, course.id);
      toast({ title: "Added to wishlist" });
    }
    router.refresh();
  };
  
  const handleBuyNow = () => {
    dataApi.enrollUser(currentUser.id, course.id);
    toast({ title: "Purchase complete!", description: "You can now start learning." });
    router.push(`/courses/${course.id}/learn`);
  };

  return (
    <>
      {/* Course Banner and Header */}
      <div className="bg-slate-900 text-white relative">
        {bannerImage &&
          <Image src={bannerImage.imageUrl} alt={course.title} fill className="object-cover opacity-20"/>
        }
        <div className="container relative py-12 px-4 md:px-6">
          <div className="w-full md:w-2/3 lg:w-1/2 space-y-4">
            <h1 className="text-4xl font-bold font-headline">{course.title}</h1>
            <p className="text-xl text-slate-300">{course.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold text-amber-400">{averageRating.toFixed(1)}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400"/>
              </div>
              <span>({reviews.length} ratings)</span>
              <span>{totalStudents} students</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Created by</span>
              <a href="#" className="font-semibold underline">{instructor?.name}</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Body */}
      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:w-2/3">
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold font-headline mb-4">What you'll learn</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                    {course.whatYouWillLearn.map((item, i) => item && (
                      <li key={i} className="flex items-start gap-2"><Check className="w-5 h-5 text-primary mt-1 shrink-0" /><span>{item}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {course.requirements && course.requirements.length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold font-headline mb-4">Requirements</h2>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    {course.requirements.map((req, i) => req && <li key={i}>{req}</li>)}
                  </ul>
                </CardContent>
              </Card>
            )}

            <h2 className="text-2xl font-bold font-headline mb-4">Course content</h2>
            <Accordion type="single" collapsible className="w-full mb-12">
              {course.sections.map(section => (
                <AccordionItem value={section.id} key={section.id}>
                  <AccordionTrigger className="font-semibold">{section.title}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {section.lectures.map(lecture => (
                        <li key={lecture.id} className="flex justify-between items-center text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {lecture.type === 'video' && <PlayCircle className="w-4 h-4"/>}
                            {lecture.type === 'quiz' && <HelpCircle className="w-4 h-4"/>}
                            {lecture.type === 'note' && <FileText className="w-4 h-4"/>}
                            <span>{lecture.title}</span>
                          </div>
                          <span>{lecture.duration}m</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div>
              <h2 className="text-2xl font-bold font-headline mb-4">Instructor</h2>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={instructorAvatar?.imageUrl} />
                  <AvatarFallback>{instructor?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{instructor?.name}</h3>
                  <p className="text-muted-foreground">{instructor?.bio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:w-1/3 self-start lg:sticky top-24">
            <Card className="overflow-hidden shadow-lg">
              {courseImage && 
                <div className="relative aspect-video">
                  <Image src={courseImage.imageUrl} alt={course.title} fill className="object-cover"/>
                </div>
              }
              <CardContent className="p-4 space-y-4">
                {isEnrolled ? (
                  <Button className="w-full" asChild>
                    <Link href={`/courses/${course.id}/learn`}>Start Learning</Link>
                  </Button>
                ) : (
                  <>
                    <p className="text-3xl font-bold">${course.price}</p>
                    <div className="flex gap-2">
                      {isInCart ? (
                        <Button className="w-full" variant="secondary" asChild>
                           <Link href="/cart">Go to Cart</Link>
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={handleAddToCart}>
                          Add to cart <ShoppingCart className="ml-2 w-4 h-4"/>
                        </Button>
                      )}
                      <Button variant="outline" size="icon" onClick={handleWishlistToggle}>
                        <Heart className={isInWishlist ? "w-4 h-4 fill-red-500 text-red-500" : "w-4 h-4"}/>
                      </Button>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={handleBuyNow}>Buy Now</Button>
                  </>
                )}
                <p className="text-center text-xs text-muted-foreground">30-Day Money-Back Guarantee</p>
                <div className="text-sm space-y-2">
                  <h4 className="font-bold">This course includes:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2"><Clock className="w-4 h-4"/><span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m total length</span></li>
                    <li className="flex items-center gap-2"><FileText className="w-4 h-4"/><span>{totalLectures} lectures</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4"/><span>Full lifetime access</span></li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4"/><span>Certificate of completion</span></li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

    