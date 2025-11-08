"use client";

import { useAuth } from "@/hooks/use-auth";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { cartApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function CartPage() {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    
    const [cartCourses, setCartCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingCourseId, setRemovingCourseId] = useState<string | null>(null);

    if (!currentUser || currentUser.role !== 'learner') {
        notFound();
    }

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                const response = await cartApi.getCart();
                setCartCourses(response.cart || []);
            } catch (err: any) {
                console.error('Failed to fetch cart:', err);
                setError(err.message || 'Failed to fetch cart');
                toast({
                    title: "Error",
                    description: "Failed to load cart. Please try again later.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [toast]);

    const handleRemoveFromCart = async (courseId: string) => {
        try {
            setRemovingCourseId(courseId);
            await cartApi.removeFromCart(courseId);
            setCartCourses(prev => prev.filter(course => course._id !== courseId));
            toast({ title: "Removed from cart" });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to remove course from cart",
                variant: "destructive"
            });
        } finally {
            setRemovingCourseId(null);
        }
    };

    const subtotal = cartCourses.reduce((sum, course) => sum + (course?.price || 0), 0);
    const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    if (loading) {
        return (
            <div className="container py-8 px-4 md:px-6">
                <h1 className="text-3xl font-bold font-headline mb-8">Shopping Cart</h1>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ))}
                    </div>
                    <div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 px-4 md:px-6">
            <h1 className="text-3xl font-bold font-headline mb-8">Shopping Cart</h1>
            {cartCourses.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartCourses.map(course => {
                            const courseImage = course.thumbnail?.url ? `${SERVER_BASE_URL}${course.thumbnail.url}` : null;
                            return (
                                <Card key={course._id}>
                                    <CardContent className="p-6">
                                        <div className="flex gap-4">
                                            <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {courseImage ? (
                                                    <img
                                                        src={courseImage}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        No image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    By {course.instructor?.name || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {course.totalLectures} lectures • {Math.floor((course.totalDuration || 0) / 60)}h {Math.floor((course.totalDuration || 0) % 60)}m
                                                </p>
                                            </div>
                                            <div className="text-right flex flex-col justify-between">
                                                <div className="text-xl font-bold">${course.price}</div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveFromCart(course._id)}
                                                    disabled={removingCourseId === course._id}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {removingCourseId === course._id ? 'Removing...' : 'Remove'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cartCourses.length} {cartCourses.length === 1 ? 'item' : 'items'})</span>
                                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg">
                                    Proceed to Checkout
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mt-4">Your cart is empty.</h2>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Start learning by adding courses to your cart!
                    </p>
                    <Button asChild>
                        <Link href="/courses">Browse Courses</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}