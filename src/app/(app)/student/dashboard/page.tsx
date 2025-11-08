import StudentDashboard from '@/components/dashboard/student/StudentDashboard';
import { Suspense } from 'react';

export default function StudentDashboardPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <Suspense fallback={<div>Loading...</div>}>
        <StudentDashboard />
      </Suspense>
    </div>
  );
}
