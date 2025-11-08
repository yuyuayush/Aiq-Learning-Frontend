
"use client";

import { useAuth } from "@/hooks/use-auth";
import { wishlistApi } from "@/lib/api";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CourseCard } from "@/components/course/CourseCard";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    
    const [wishlistCourses, setWishlistCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!currentUser || currentUser.role !== 'learner') {
        notFound();
    }

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                setLoading(true);
                const response = await wishlistApi.getWishlist();
                setWishlistCourses(response.wishlist || []);
            } catch (err: any) {
                console.error('Failed to fetch wishlist:', err);
                setError(err.message || 'Failed to fetch wishlist');
                toast({
                    title: "Error",
                    description: "Failed to load wishlist. Please try again later.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [toast]);

    if (loading) {
        return (
            <div className="container py-8 px-4 md:px-6">
                <h1 className="text-4xl font-bold font-headline mb-8">My Wishlist</h1>
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

    return (
        <div className="container py-8 px-4 md:px-6">
            <h1 className="text-4xl font-bold font-headline mb-8">My Wishlist</h1>
            {wishlistCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {wishlistCourses.map((course) => (
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
                            } as any}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Heart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-semibold">Your wishlist is empty</h3>
                    <p className="mt-1 text-gray-500">
                        Start exploring our courses and add them to your wishlist!
                    </p>
                    <Button className="mt-4" asChild>
                        <Link href="/courses">Browse Courses</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
