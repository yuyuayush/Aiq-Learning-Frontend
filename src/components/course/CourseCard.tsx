
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Course } from "@/lib/types";
import { dataApi } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Star } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SERVER_BASE_URL = API_BASE_URL.replace('/api', '');

interface CourseCardProps {
  course: Course & {
    // Additional fields from backend that might not be in the Course type
    instructor?: any; // Can be string ID or populated object
    ratings?: {
      average: number;
      count: number;
    };
    enrolledStudents?: number;
    totalLectures?: number;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  // Handle both populated instructor object and ID string
  const instructor = typeof course.instructor === 'object' && course.instructor 
    ? course.instructor 
    : course.instructorId 
      ? dataApi.getUserById(course.instructorId) 
      : null;
      
  // Handle course image - prioritize backend URLs with correct server path
  const getImageUrl = () => {
    if (course.thumbnail?.url) {
      return `${SERVER_BASE_URL}${course.thumbnail.url}`;
    }
    if (course.banner?.url) {
      return `${SERVER_BASE_URL}${course.banner.url}`;
    }
    // Fallback to placeholder images for mock data
    const courseImage = PlaceHolderImages.find((p) => p.id === course.thumbnailId);
    return courseImage?.imageUrl;
  };

  const imageUrl = getImageUrl();
  console.log('CourseCard - course.thumbnail:', course.thumbnail, 'imageUrl:', imageUrl); // Debug
      
  // Handle ratings from backend or mock data
  const averageRating = course.ratings?.average || course.averageRating || 0;
  const reviewCount = course.ratings?.count || 0;
  
  // Fallback to mock reviews if no backend ratings
  if (!course.ratings && course.id) {
    const reviews = dataApi.getReviewsByCourseId(course.id);
    const mockAverageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    if (averageRating === 0 && mockAverageRating > 0) {
      // Use mock data as fallback
    }
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/courses/${course._id || course.id}`} className="flex flex-col h-full">
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-gray-500">
                No image
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-lg h-12 leading-tight overflow-hidden font-light">
            {course.title}
          </CardTitle>
          <CardDescription className="mt-1 text-sm">
            {instructor?.name}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-1">
                <span className="font-bold text-amber-500">{averageRating.toFixed(1)}</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500"/>
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
            <div className="font-bold text-lg">${course.price}</div>
        </CardFooter>
      </Link>
    </Card>
  );
}

    