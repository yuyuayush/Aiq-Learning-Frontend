
"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CourseCard } from "@/components/course/CourseCard";
import { dataApi } from "@/lib/data";
import { SearchX } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const courses = dataApi.searchCourses(query);

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold font-headline">
          Search results for "{query}"
        </h1>
        <p className="text-muted-foreground">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} found.
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <div className="mx-auto bg-muted rounded-full h-16 w-16 flex items-center justify-center">
                <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mt-4">No courses found</h2>
            <p className="text-muted-foreground mt-2">
                We couldn't find any courses matching your search. Try another term.
            </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading search results...</div>}>
            <SearchResults />
        </Suspense>
    )
}
