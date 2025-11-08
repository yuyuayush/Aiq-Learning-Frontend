
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import Logo from "@/components/Logo";

export default function InstructorLoginPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Always redirect to the appropriate dashboard
      const redirectPath = currentUser?.role === 'instructor' ? '/instructor/dashboard' : '/learner/dashboard';
      router.push(redirectPath);
    }
  }, [isAuthenticated, currentUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href={"/"}><img
            src="/logo/logo.png"
            alt="logo"
            className="h-20 w-auto object-contain"
          /></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Instructor Login</CardTitle>
            <CardDescription>Enter your credentials to access your instructor dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm allowedRole="instructor" />
          </CardContent>
        </Card>
        <p className="text-center text-sm ">
          Not an instructor?{" "}
          <Link href="/login" className="font-semibold  hover:underline">
            Login as a student
          </Link>
        </p>
      </div>
    </div>
  );
}
